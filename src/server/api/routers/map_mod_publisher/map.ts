import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Map, MapSide } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { displayNameSchema_NonObject, userIdSchema_NonObject } from "../user";
import axios from "axios";
import { ADMIN_PERMISSION_STRINGS, checkIsPrivileged } from "../../utils/permissions";
import { modIdSchema_NonObject } from "./mod";
import { difficultyIdSchema_NonObject } from "../difficulty";
import { lengthIdSchema_NonObject } from "../length";
import { techIdSchema_NonObject } from "../techs/tech";




export const defaultMapSelect = Prisma.validator<Prisma.MapSelect>()({
    id: true,
    modId: true,
    mapperUserId: true,
    mapperNameString: true,
    name: true,
    canonicalDifficultyId: true,
    lengthId: true,
    description: true,
    notes: true,
    chapter: true,
    side: true,
    overallRank: true,
    mapRemovedFromModBool: true,
    timeSubmitted: true,
    timeApproved: true,
    Map_Archive: { select: { id: true } },
    MapsToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
    ReviewMap: { select: { id: true } },
});




const mapNameSchema_NonObject = z.string().min(1).max(200);

const mapDescriptionSchema_NonObject = z.string().min(1).max(500);

const mapNotesSchema_NonObject = z.string().min(1).max(500);


const mapSideSchema_NonObject = z.enum(getNonEmptyArray(MapSide));

const mapSideSchema = z.object({
    side: mapSideSchema_NonObject,
}).strict();


export const mapIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.mediumInt.unsigned);

const mapIdSchema = z.object({
    id: mapIdSchema_NonObject,
}).strict();


export const mapperUserIdSchema = z.object({
    mapperUserId: userIdSchema_NonObject.optional(),
}).strict();

export type MapperUserId = z.infer<typeof mapperUserIdSchema>;




const mapSchema_base = z.object({
    name: mapNameSchema_NonObject,
    canonicalDifficultyId: difficultyIdSchema_NonObject,
    lengthId: lengthIdSchema_NonObject,
    description: mapDescriptionSchema_NonObject.nullable().default(null),
    notes: mapNotesSchema_NonObject.nullable().default(null),
    mapRemovedFromModBool: z.boolean(),
    techAnyIds: techIdSchema_NonObject.array().optional(),
    techFullClearIds: techIdSchema_NonObject.array().optional(),
}).strict();


const mapSchema_Normal = mapSchema_base.extend({
    chapter: z.number().int().min(1).max(intMaxSizes.tinyInt.unsigned),
    side: mapSideSchema_NonObject,
}).strict();


const mapSchema_Collab_Contest_Lobby = mapSchema_base.extend({
    mapperUserId: userIdSchema_NonObject.optional(),
    mapperNameString: displayNameSchema_NonObject.optional(),
    overallRank: z.number().int().min(1).max(intMaxSizes.tinyInt.unsigned),
}).strict();

const refineCollabContestLobby = (data: any) => {   //TODO: add type for data
    if (data.mapperUserId && data.mapperNameString) return false;

    if (data.mapperUserId || data.mapperNameString) return true;

    return false;
}


const modIdForMapSchema = z.object({
    modId: modIdSchema_NonObject,
}).strict();

const mapSoloPostSchema = z.union([
    mapSchema_Normal.merge(modIdForMapSchema),
    mapSchema_Collab_Contest_Lobby.merge(modIdForMapSchema).refine(refineCollabContestLobby),
]);

export const mapPostWithModSchema = z.union([
    mapSchema_Normal,
    mapSchema_Collab_Contest_Lobby.refine(refineCollabContestLobby),
]);


export const mapOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.MapScalarFieldEnum),
    ["modId", "mapRemovedFromModBool", "chapter", "side", "overallRank", "mapperNameString", "id"],
    ["asc"],
);




const getMapByGamebananaId = async (prisma: MyPrismaClient, gamebananaId: number, throwOnMatch: boolean) => {       //TODO?: add type declaration
    const matchingMap: Map | null = await prisma.map.findUnique({
        where: { gamebananaId: gamebananaId },
        select: defaultMapSelect,
    });


    if (throwOnMatch) {
        if (matchingMap) throw new TRPCError({
            message: `Conflicts with existing map ${matchingMap.id}`,
            code: "FORBIDDEN",
        });
    }
    else {
        if (!matchingMap) throw new TRPCError({
            message: `No map exists with gamebananaId "${gamebananaId}"`,
            code: "NOT_FOUND",
        });

        return matchingMap;
    }
}




const getMapById = async (prisma: MyPrismaClient, id: number) => {      //TODO?: add type declaration
    const map: map | null = await prisma.map.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultMapSelect,
    });

    if (!map) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No map exists with id "${id}"`,
        });
    }

    return map;
}




const getGamebananaUsernameById = async function (gamebananaID: number) {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Member/IdentifyById?userid=${gamebananaID}`
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            throw "GameBanana api not responding as expected.";
        }

        const gamebananaName = String(axiosResponse.data[0]);

        return gamebananaName;
    }
    catch (error) {
        throw new TRPCError({
            message: "Error getting gamebanana username.",
            code: "INTERNAL_SERVER_ERROR",
        });
    }
}




export const mapRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(mapOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.map.findMany({
                select: defaultMapSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(mapOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const maps = await ctx.prisma.map.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultMapSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return maps;
        }),

    getById: publicProcedure
        .input(mapIdSchema)
        .query(async ({ ctx, input }) => {
            return await getMapById(ctx.prisma, input.id);
        }),

    getByGamebananaId: publicProcedure
        .input(mapGamebananaIdSchema)
        .query(async ({ ctx, input }) => {
            return await getMapByGamebananaId(ctx.prisma, input.gamebananaId, false);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: mapNameSchema_NonObject,
            }).strict().merge(mapOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const maps = await ctx.prisma.map.findMany({
                where: { name: { contains: input.query } },
                select: defaultMapSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return maps;
        }),

    add: adminProcedure
        .input(mapPostSchema)
        .mutation(async ({ ctx, input }) => {
            await getMapByGamebananaId(ctx.prisma, input.gamebananaId, true);     //check that the new map won't conflict with an existing one


            const gamebananaUsername = await getGamebananaUsernameById(input.gamebananaId);


            const map = await ctx.prisma.map.create({
                data: {
                    gamebananaId: input.gamebananaId,
                    name: gamebananaUsername,
                    user: { connect: { id: input.userId } },
                },
                select: defaultMapSelect,
            });


            return map;
        }),

    editGamebananaId: loggedInProcedure
        .input(mapGamebananaIdSchema.merge(mapIdSchema))
        .mutation(async ({ ctx, input }) => {
            const mapFromId = await getMapById(ctx.prisma, input.id);  //check that id matches an existing map

            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, mapFromId.userId ?? -1);  //check that the user is permitted to edit this map


            await getMapByGamebananaId(ctx.prisma, input.gamebananaId, true);     //check that the new map won't conflict with an existing one


            const gamebananaUsername = await getGamebananaUsernameById(input.gamebananaId);


            const map = await ctx.prisma.map.update({
                where: { id: input.id },
                data: {
                    gamebananaId: input.gamebananaId,
                    name: gamebananaUsername,
                },
                select: defaultMapSelect,
            });


            return map;
        }),


    editConnectedUser: adminProcedure
        .input(z.object({
            userId: userIdSchema_NonObject,
        }).strict().merge(mapIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getMapById(ctx.prisma, input.id);  //check that id matches an existing map

            return await ctx.prisma.map.update({
                where: { id: input.id },
                data: {
                    user: { connect: { id: input.userId } },
                },
                select: defaultMapSelect,
            });
        }),

    delete: loggedInProcedure
        .input(mapIdSchema)
        .mutation(async ({ ctx, input }) => {
            const mapFromId = await getMapById(ctx.prisma, input.id);  //check that id matches an existing map

            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, mapFromId.userId ?? -1);  //check that the user is permitted to edit this map

            await ctx.prisma.map.delete({ where: { id: input.id } });

            return true;
        }),
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure, modlistModeratorProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, archive_mod, mod, mod_type, unapproved_mod } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { userIdSchema_NonObject } from "../user";
import axios, { AxiosResponse } from "axios";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged, checkPermissions } from "../../utils/permissions";
import { mapPostWithModSchema, mapperUserId, mapperUserIdSchema } from "./map";
import { PUBLISHER_NAME_MAX_LENGTH } from "./publisher";




type TrimmedMod = Omit<mod, "submittedBy" | "approvedBy"> & { map: { id: number }[] };
type TrimmedArchiveMod = Omit<archive_mod, "submittedBy" | "approvedBy"> & { archive_map: { id: number }[] };
type TrimmedUnapprovedMod = Omit<unapproved_mod, "submittedBy"> & { unapproved_map: { id: number }[] };




const baseModSelectObject = {
    id: true,
    type: true,
    name: true,
    publisherId: true,
    contentWarning: true,
    notes: true,
    shortDescription: true,
    longDescription: true,
    gamebananaModId: true,
    timeSubmitted: true,
    timeCreatedGamebanana: true,
};


const defaultModSelect = Prisma.validator<Prisma.modSelect>()({
    ...baseModSelectObject,
    timeApproved: true,
    archive_mod: { select: { id: true } },
    unapproved_mod: { select: { id: true } },
    map: { select: { id: true } },
    review: { select: { id: true } },
});


const archiveModSelect = Prisma.validator<Prisma.archive_modSelect>()({
    ...baseModSelectObject,
    modId: true,
    timeApproved: true,
    timeArchived: true,
    archive_map: { select: { id: true } },
});


const unapprovedModSelect = Prisma.validator<Prisma.unapproved_modSelect>()({
    ...baseModSelectObject,
    modId: true,
    unapproved_map: { select: { id: true } },
});




const MOD_NAME_MAX_LENGTH = 200;

const modNameSchema_NonObject = z.string().min(1).max(MOD_NAME_MAX_LENGTH);

const modNotesSchema_NonObject = z.string().min(1).max(500);

const modShortDescriptionSchema_NonObject = z.string().min(1).max(150);

const modLongDescriptionSchema_NonObject = z.string().min(1).max(1500);


const gamebananaModIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.mediumInt.unsigned);

const gamebananaModIdSchema = z.object({
    gamebananaModId: gamebananaModIdSchema_NonObject,
}).strict();


export const modIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.smallInt.unsigned);

const modIdSchema = z.object({
    id: modIdSchema_NonObject,
}).strict();


const modTypeSchema_NonObject = z.enum(getNonEmptyArray(mod_type));

const modTypeSchema = z.object({
    type: modTypeSchema_NonObject,
}).strict();


const modPostSchema = z.object({
    type: modTypeSchema_NonObject,
    contentWarning: z.boolean(),
    notes: modNotesSchema_NonObject.nullable().default(null),
    shortDescription: modShortDescriptionSchema_NonObject,
    longDescription: modLongDescriptionSchema_NonObject.nullable().default(null),
    gamebananaModId: gamebananaModIdSchema_NonObject,
    maps: mapPostWithModSchema.array().nonempty(),
}).strict();


const modOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.ModScalarFieldEnum),
    ["publisherId", "timeCreatedGamebanana"],
    ["asc"],
);




const getModByGamebananaModId = async (prisma: MyPrismaClient, gamebananaModId: number, throwOnMatch: boolean) => {
    const matchingMod = await prisma.mod.findUnique({
        where: { gamebananaModId: gamebananaModId },
        select: defaultModSelect,
    });


    if (throwOnMatch) {
        if (matchingMod) throw new TRPCError({
            code: "FORBIDDEN",
            message: `Conflicts with existing mod ${matchingMod.id}`,
        });
    }
    else {
        if (!matchingMod) throw new TRPCError({
            code: "NOT_FOUND",
            message: `No mod exists with gamebananaModId "${gamebananaModId}"`,
        });

        return matchingMod;
    }
}




const getModById = async<
    TableName extends "mod" | "archive_mod" | "unapproved_mod",
    ReturnType extends (
        TableName extends "mod" ? TrimmedMod :
        (
            TableName extends "archive_mod" ? TrimmedArchiveMod :
            TrimmedUnapprovedMod
        )
    ) | null,
>(
    prisma: MyPrismaClient,
    id: number,
    tableName: TableName
): Promise<
    ReturnType
> => {
    let mod: any;   //TODO!: add type declaration

    if (tableName == "mod") {
        mod = await prisma.mod.findUnique({  //having type declaration here AND in function signature is safer
            where: { id: id },
            select: defaultModSelect,
        });
    }
    else if (tableName == "archive_mod") {
        mod = await prisma.archive_mod.findUnique({
            where: { id: id },
            select: archiveModSelect,
        });
    }
    else if (tableName == "unapproved_mod") {
        mod = await prisma.unapproved_mod.findUnique({
            where: { id: id },
            select: unapprovedModSelect,
        });
    }
    else {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Invalid table name "${tableName}"`,
        });
    }


    if (!mod) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No mod exists in table "${tableName}" with id "${id}"`,
        });
    }


    return mod;
}




type GamebananaModInfo = {
    publisherGamebananaId: number,
    publisherName: string,
    timeCreatedGamebanana: number,
    gamebananaModName: string,
}


const getGamebananaModInfo = async function (gamebananaModID: number): Promise<GamebananaModInfo> {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Item/Data?return_keys=true&itemtype=Mod&itemid=${gamebananaModID}&fields=userid,Owner().name,date,name`,
        };


        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            throw "GameBanana api not responding as expected.";
        }


        const { userid, "Owner().name": publisherName, date, name: gamebananaModName } = JSON.parse(axiosResponse.data);

        if (!userid || !publisherName || !date || !gamebananaModName) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error getting gamebanana mod info.",
        });

        if (publisherName > PUBLISHER_NAME_MAX_LENGTH) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Gamebanana publisher name for publisherGamebananaId ${userid} too long. Please contact an admin.`,
        });

        if (gamebananaModName > MOD_NAME_MAX_LENGTH) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Gamebanana mod name for gamebananaModId ${gamebananaModID} too long. Please contact an admin.`,
        });


        return { publisherGamebananaId: userid, publisherName, timeCreatedGamebanana: date, gamebananaModName };
    }
    catch (error) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error getting gamebanana mod info.",
        });
    }
}




export const modRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(modOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.mod.findMany({
                select: defaultModSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(modOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const mods = await ctx.prisma.mod.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultModSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return mods;
        }),

    getById: publicProcedure
        .input(modIdSchema)
        .query(async ({ ctx, input }) => {
            return await getModById(ctx.prisma, input.id, "mod");
        }),

    getByGamebananaModId: publicProcedure
        .input(gamebananaModIdSchema)
        .query(async ({ ctx, input }) => {
            return await getModByGamebananaModId(ctx.prisma, input.gamebananaModId, false);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: modNameSchema_NonObject,
            }).strict().merge(modOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const mods = await ctx.prisma.mod.findMany({
                where: { name: { contains: input.query } },
                select: defaultModSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return mods;
        }),

    add: loggedInProcedure
        .input(modPostSchema)
        .mutation(async ({ ctx, input }) => {
            await getModByGamebananaModId(ctx.prisma, input.gamebananaModId, true);     //check that the new mod won't conflict with an existing one


            const gamebananaModInfo = await getGamebananaModInfo(input.gamebananaModId);


            let mod: TrimmedMod | TrimmedUnapprovedMod;

            const modCreateData_base: Prisma.modCreateInput | Prisma.unapproved_modCreateInput = {
                type: input.type,
                name: gamebananaModInfo.gamebananaModName,
                contentWarning: input.contentWarning,
                notes: input.notes,
                shortDescription: input.shortDescription,
                longDescription: input.longDescription,
                gamebananaModId: input.gamebananaModId,
                timeSubmitted: 5,   //TODO: change this to the actual time
                timeCreatedGamebanana: gamebananaModInfo.timeCreatedGamebanana,
                publisher: {
                    connectOrCreate: {
                        where: { gamebananaId: gamebananaModInfo.publisherGamebananaId },
                        create: {
                            gamebananaId: gamebananaModInfo.publisherGamebananaId,
                            name: gamebananaModInfo.publisherName,
                        },
                    },
                },
            };


            const mapCreateDataArray_base: (Prisma.mapCreateWithoutModInput & mapperUserId)[] | (Prisma.unapproved_mapCreateWithoutUnapproved_modInput & mapperUserId)[] = input.maps.map((map) => {
                return {
                    mapperUserId: "mapperUserId" in map ? map.mapperUserId : undefined,
                    mapperNameString: ("mapperNameString" in map ? map.mapperNameString : undefined) ?? gamebananaModInfo.publisherName,
                    name: map.name,
                    description: map.description,
                    notes: map.notes,
                    chapter: "chapter" in map ? map.chapter : undefined,
                    side: "side" in map ? map.side : undefined,
                    overallRank: "overallRank" in map ? map.overallRank : undefined,
                    mapRemovedFromModBool: map.mapRemovedFromModBool,
                    timeSubmitted: 5,   //TODO: change this to the actual time
                    difficulty: { connect: { id: map.canonicalDifficultyId } },
                    length: { connect: { id: map.lengthId } },
                };
            });


            if (checkPermissions(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user.permissions)) {
                const mapCreateDataArray_approved: Prisma.mapCreateWithoutModInput[] = mapCreateDataArray_base.map((map) => {
                    return {
                        ...map,
                        mapperUserId: undefined,
                        user_map_mapperUserIdTouser: { connect: { id: map.mapperUserId } },
                        user_map_submittedByTouser: { connect: { id: ctx.user.id } },
                        timeApproved: 5,    //TODO: change this to the actual time
                        user_map_approvedByTouser: { connect: { id: ctx.user.id } },
                    };
                });


                mod = await ctx.prisma.mod.create({
                    data: {
                        ...modCreateData_base,
                        user_mod_submittedByTouser: { connect: { id: ctx.user.id } },
                        timeApproved: 5,    //TODO: change this to the actual time
                        user_mod_approvedByTouser: { connect: { id: ctx.user.id } },
                        map: { create: mapCreateDataArray_approved },
                    },
                    select: defaultModSelect,
                });
            }
            else {
                const mapCreateDataArray_unapproved: Prisma.unapproved_mapCreateWithoutUnapproved_modInput[] = mapCreateDataArray_base.map((map) => {
                    return {
                        ...map,
                        mapperUserId: undefined,
                        user_unapproved_map_mapperUserIdTouser: { connect: { id: map.mapperUserId } },
                        user_unapproved_map_submittedByTouser: { connect: { id: ctx.user.id } },
                    };
                });


                mod = await ctx.prisma.unapproved_mod.create({
                    data: {
                        ...modCreateData_base,
                        user: { connect: { id: ctx.user.id } },
                        unapproved_map: { create: mapCreateDataArray_unapproved },
                    },
                    select: defaultModSelect,
                });
            }


            return mod;
        }),

    archive: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const modFromId = await getModById(ctx.prisma, input.id, "mod");

            const archivedMod = await ctx.prisma.archive_mod.create({
                data: {
                    ...modFromId,
                    archive_map: {
                        create: modFromId.map.map((map) => {
                            return {
                                ...map,
                                
                            };
                        })
                    },
                },
            });

            await ctx.prisma.mod.delete({ where: { id: input.id } });

            return archivedMod;
        }),

    unarchive: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const modFromId = await getModById(ctx.prisma, input.id, "archive_mod");

            const unarchivedMod = await ctx.prisma.mod.create({
                data: {
                    ...modFromId,
                    map: {
                        create: modFromId.archive_map.map((map) => {
                            return {
                                ...map,

                            };
                        })
                    },
                },
            });

            await ctx.prisma.archive_mod.delete({ where: { id: input.id } });

            return unarchivedMod;
        }),


    delete: adminProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById(ctx.prisma, input.id, "archive_mod");  //check that id matches an existing mod

            await ctx.prisma.archive_mod.delete({ where: { id: input.id } });

            return true;
        }),
});
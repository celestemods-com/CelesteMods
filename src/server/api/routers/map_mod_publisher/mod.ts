import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure, modlistModeratorProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, ModType, Mod, Map, Mod_Archive, Map_Archive, Mod_Edit, Map_Edit, Mod_New, Map_New } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { userIdSchema_NonObject } from "../user";
import axios, { AxiosResponse } from "axios";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged, checkPermissions } from "../../utils/permissions";
import { mapPostWithModSchema, MapperUserId, mapperUserIdSchema } from "./map";
import { PUBLISHER_NAME_MAX_LENGTH } from "./publisher";
import { getCurrentTime } from "../../utils/getCurrentTime";




type TrimmedMod = Omit<Mod, "submittedBy" | "approvedBy"> & { Map: { id: number }[] };
type TrimmedArchiveMod = Omit<Mod_Archive, "submittedBy" | "approvedBy"> & { Map_Archive: { id: number }[] };
type TrimmedModEdit = Omit<Mod_Edit, "submittedBy"> & { Map_Edit: { id: number }[] };
type TrimmedModNew = Omit<Mod_New, "submittedBy"> & { Map_New: { id: number }[] };

type ExpandedMod = Mod & { Map: Map[] };
type ExpandedArchiveMod = Mod_Archive & { Map_Archive: Map_Archive[] };
type ExpandedModEdit = Mod_Edit & { Map_Edit: Map_Edit[] };
type ExpandedModNew = Mod_New & { Map_New: Map_New[] };




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


const defaultModSelect = Prisma.validator<Prisma.ModSelect>()({
    ...baseModSelectObject,
    timeApproved: true,
    Map: { select: { id: true } },
    Mod_Archive: { select: { id: true } },
    Mod_Edit: { select: { id: true } },
    Review: { select: { id: true } },
});


const modArchiveSelect = Prisma.validator<Prisma.Mod_ArchiveSelect>()({
    ...baseModSelectObject,
    modId: true,
    timeApproved: true,
    timeArchived: true,
});


const modEditSelect = Prisma.validator<Prisma.Mod_EditSelect>()({
    ...baseModSelectObject,
    modId: true,
});


const modNewSelect = Prisma.validator<Prisma.Mod_NewSelect>()({
    ...baseModSelectObject,
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


const modTypeSchema_NonObject = z.enum(getNonEmptyArray(ModType));

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
    ["publisherId", "timeCreatedGamebanana", "name"],
    ["asc"],
);




// const getModByGamebananaModId = async (prisma: MyPrismaClient, gamebananaModId: number, throwOnMatch: boolean) => {
//     const matchingMod = await prisma.mod.findUnique({
//         where: { gamebananaModId: gamebananaModId },
//         select: defaultModSelect,
//     });


//     if (throwOnMatch) {
//         if (matchingMod) throw new TRPCError({
//             code: "FORBIDDEN",
//             message: `Conflicts with existing mod ${matchingMod.id}`,
//         });
//     }
//     else {
//         if (!matchingMod) throw new TRPCError({
//             code: "NOT_FOUND",
//             message: `No mod exists with gamebananaModId "${gamebananaModId}"`,
//         });

//         return matchingMod;
//     }
// }




export const getModById = async<
    TableName extends "Mod" | "Mod_Archive" | "Mod_Edit" | "Mod_New",
    IdType extends "mod" | "gamebanana",
    ReturnAll extends boolean,
    ThrowOnMatch extends boolean,
    ModUnion extends (
        TableName extends "Mod" ?
        (
            ReturnAll extends true ? ExpandedMod : TrimmedMod
        ) :
        (
            TableName extends "Mod_Archive" ?
            (
                ReturnAll extends true ? ExpandedArchiveMod : TrimmedArchiveMod
            ) :
            (
                TableName extends "Mod_Edit" ?
                (
                    ReturnAll extends true ? ExpandedModEdit : TrimmedModEdit
                ) :
                (
                    TableName extends "Mod_New" ?
                    (
                        ReturnAll extends true ? ExpandedModNew : TrimmedModNew
                    ) :
                    never
                )
            )
        )
    ) | null,
    ReturnType extends (
        ThrowOnMatch extends true ? void : NonNullable<ModUnion>
    ),
>(
    tableName: TableName,
    idType: IdType,
    returnAll: ReturnAll,
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    id: number,
    customErrorMessage?: string,
): Promise<
    ReturnType
> => {
    const whereObject = idType == "mod" ? { id: id } : { gamebananaModId: id };


    let mod: ModUnion;

    if (tableName == "Mod") {
        mod = await prisma.mod.findUnique({
            where: whereObject,
            select: returnAll ? undefined : defaultModSelect,
        }) as ModUnion;
    }
    else if (tableName == "Mod_Archive") {
        mod = await prisma.mod_Archive.findUnique({
            where: whereObject,
            select: returnAll ? undefined : modArchiveSelect,
        }) as ModUnion;
    }
    else if (tableName == "Mod_Edit") {
        mod = await prisma.mod_Edit.findUnique({
            where: whereObject,
            select: returnAll ? undefined : modEditSelect,
        }) as ModUnion;
    }
    else if (tableName == "Mod_New") {
        mod = await prisma.mod_New.findUnique({
            where: whereObject,
            select: returnAll ? undefined : modNewSelect,
        }) as ModUnion;
    }
    else {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: customErrorMessage ?? `Invalid table name "${tableName}"`,
        });
    }


    if (throwOnMatch) {
        if (mod) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: customErrorMessage ?? `Conflicts with existing mod ${id}`,
            });
        }

        return undefined as ReturnType;
    }
    else {
        if (!mod) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: customErrorMessage ?? `No mod exists in table "${tableName}" with id "${id}"`,
            });
        }


        return mod as ReturnType;
    }
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
            return await getModById("Mod", "mod", false, false, ctx.prisma, input.id);
        }),

    getByGamebananaModId: publicProcedure
        .input(gamebananaModIdSchema)
        .query(async ({ ctx, input }) => {
            return await getModById("Mod", "gamebanana", false, false, ctx.prisma, input.gamebananaModId);
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
            await getModById("Mod", "gamebanana", false, true, ctx.prisma, input.gamebananaModId);     //check that the new mod won't conflict with an existing one


            const gamebananaModInfo = await getGamebananaModInfo(input.gamebananaModId);


            const currentTime = getCurrentTime();


            let mod: TrimmedMod | TrimmedModNew;

            const modCreateData_base: Prisma.ModCreateInput | Prisma.Mod_NewCreateInput = {
                type: input.type,
                name: gamebananaModInfo.gamebananaModName,
                contentWarning: input.contentWarning,
                notes: input.notes,
                shortDescription: input.shortDescription,
                longDescription: input.longDescription,
                gamebananaModId: input.gamebananaModId,
                timeSubmitted: currentTime,
                timeCreatedGamebanana: gamebananaModInfo.timeCreatedGamebanana,
                Publisher: {
                    connectOrCreate: {
                        where: { gamebananaId: gamebananaModInfo.publisherGamebananaId },
                        create: {
                            gamebananaId: gamebananaModInfo.publisherGamebananaId,
                            name: gamebananaModInfo.publisherName,
                        },
                    },
                },
            };


            const mapCreateDataArray_base: (Prisma.MapCreateWithoutModInput & MapperUserId)[] | (Prisma.Map_NewCreateWithoutMod_NewInput & MapperUserId)[] = input.maps.map((map) => {
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
                    timeSubmitted: currentTime,
                    Difficulty: { connect: { id: map.canonicalDifficultyId } },
                    Length: { connect: { id: map.lengthId } },
                };
            });


            if (checkPermissions(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user.permissions)) {
                const mapCreateDataArray_approved: Prisma.MapCreateWithoutModInput[] = mapCreateDataArray_base.map((map) => {
                    return {
                        ...map,
                        mapperUserId: undefined,
                        user_map_mapperUserIdTouser: { connect: { id: map.mapperUserId } },
                        user_map_submittedByTouser: { connect: { id: ctx.user.id } },
                        timeApproved: currentTime,
                        user_map_approvedByTouser: { connect: { id: ctx.user.id } },
                    };
                });


                mod = await ctx.prisma.mod.create({
                    data: {
                        ...modCreateData_base,
                        User_SubmittedBy: { connect: { id: ctx.user.id } },
                        timeApproved: currentTime,
                        User_ApprovedBy: { connect: { id: ctx.user.id } },
                        Map: { create: mapCreateDataArray_approved },
                    },
                    select: defaultModSelect,
                });


                await ctx.prisma.mod_New.deleteMany({ where: { gamebananaModId: input.gamebananaModId } });     //if the same mod has already been submitted, delete the unapproved submission
            }
            else {
                await getModById(
                    "Mod_New", "gamebanana", false, true, ctx.prisma, input.gamebananaModId, "A mod with this gamebanana id has already been submitted"
                );     //check that the new mod hasn't already been submitted


                const mapCreateDataArray_new: Prisma.Map_NewCreateWithoutMod_NewInput[] = mapCreateDataArray_base.map((map) => {
                    return {
                        ...map,
                        mapperUserId: undefined,
                        user_unapproved_map_mapperUserIdTouser: { connect: { id: map.mapperUserId } },
                        user_unapproved_map_submittedByTouser: { connect: { id: ctx.user.id } },
                    };
                });


                mod = await ctx.prisma.mod_New.create({
                    data: {
                        ...modCreateData_base,
                        User_SubmittedBy: { connect: { id: ctx.user.id } },
                        Map_New: { create: mapCreateDataArray_new },
                    },
                    select: defaultModSelect,
                });
            }


            return mod;
        }),

    approveNew: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const newMod = await getModById("Mod_New", "mod", true, false, ctx.prisma, input.id);

            const currentTime = getCurrentTime();


            const approvedMod = await ctx.prisma.mod.create({
                data: {
                    type: newMod.type,
                    name: newMod.name,
                    contentWarning: newMod.contentWarning,
                    notes: newMod.notes,
                    shortDescription: newMod.shortDescription,
                    longDescription: newMod.longDescription,
                    gamebananaModId: newMod.gamebananaModId,
                    timeSubmitted: newMod.timeSubmitted,
                    User_SubmittedBy: { connect: { id: newMod.submittedBy ?? undefined } },
                    timeApproved: currentTime,
                    User_ApprovedBy: { connect: { id: ctx.user.id } },
                    timeCreatedGamebanana: newMod.timeCreatedGamebanana,
                    Publisher: { connect: { id: newMod.publisherId } },
                    Map: {
                        create: newMod.Map_New.map(
                            (newMap) => {
                                return {
                                    mapperNameString: newMap.mapperNameString,
                                    User_MapperUser: { connect: { id: newMap.mapperUserId ?? undefined } },
                                    name: newMap.name,
                                    description: newMap.description,
                                    notes: newMap.notes,
                                    chapter: newMap.chapter,
                                    side: newMap.side,
                                    overallRank: newMap.overallRank,
                                    mapRemovedFromModBool: newMap.mapRemovedFromModBool,
                                    timeSubmitted: newMap.timeSubmitted,
                                    User_SubmittedBy: { connect: { id: newMap.submittedBy ?? undefined } },
                                    timeApproved: currentTime,
                                    User_ApprovedBy: { connect: { id: ctx.user.id } },
                                    Difficulty: { connect: { id: newMap.canonicalDifficultyId } },
                                    Length: { connect: { id: newMap.lengthId } },
                                };
                            },
                        ),
                    },
                },
                select: defaultModSelect,
            });


            await ctx.prisma.mod_New.delete({ where: { id: input.id } });    //the deletion should cascade to any unapproved_maps


            return approvedMod;
        }),

    rejectNew: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById("Mod_New", "mod", false, false, ctx.prisma, input.id);

            await ctx.prisma.mod_New.delete({ where: { id: input.id } });    //the deletion should cascade to any unapproved_maps

            return true;
        }),

    update: modlistModeratorProcedure
        .input(modPostSchema.partial().merge(modIdSchema))
        .mutation(async ({ ctx, input }) => {
            const existingMod = await getModById("Mod", "mod", true, false, ctx.prisma, input.id);

            const currentTime = getCurrentTime();


            let mod: TrimmedMod | TrimmedModEdit;

            if (checkPermissions(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user.permissions)) {
                await ctx.prisma.mod_Archive.create({
                    data: {
                        Mod: { connect: { id: existingMod.id } },
                        type: existingMod.type,
                        name: existingMod.name,
                        Publisher: { connect: { id: existingMod.publisherId } },
                        contentWarning: existingMod.contentWarning,
                        notes: existingMod.notes,
                        shortDescription: existingMod.shortDescription,
                        longDescription: existingMod.longDescription,
                        gamebananaModId: existingMod.gamebananaModId,
                        timeCreatedGamebanana: existingMod.timeCreatedGamebanana,
                        timeSubmitted: existingMod.timeSubmitted,
                        User_SubmittedBy: { connect: { id: existingMod.submittedBy ?? undefined } },
                        timeApproved: existingMod.timeApproved,
                        User_ApprovedBy: { connect: { id: existingMod.approvedBy ?? undefined } },
                        timeArchived: currentTime,
                    },
                });


                mod = await ctx.prisma.mod.update({
                    where: { id: input.id },
                    data: {
                        type: input.type,
                        name: input.name,   //TODO: errors are because this info comes directly from gamebanana. need to decide how to handle. probably, just make a different moderator procedure for updating from gamebanana
                        Publisher: { connect: { id: input.publisherId } },
                        contentWarning: input.contentWarning,
                        notes: input.notes,
                        shortDescription: input.shortDescription,
                        longDescription: input.longDescription,
                        gamebananaModId: input.gamebananaModId,
                        timeSubmitted: currentTime,
                        User_SubmittedBy: { connect: { id: ctx.user.id } },
                        timeApproved: currentTime,
                        User_ApprovedBy: { connect: { id: ctx.user.id } },
                        timeCreatedGamebanana: input.timeCreatedGamebanana,
                    },
                    select: defaultModSelect,
                });
            }
            else {
                mod = await ctx.prisma.mod_Edit.create({
                    data: {
                        Mod: { connect: { id: existingMod.id } },
                        type: input.type,
                        name: input.name,
                        Publisher: { connect: { id: input.publisherId } },
                        contentWarning: input.contentWarning,
                        notes: input.notes,
                        shortDescription: input.shortDescription,
                        longDescription: input.longDescription,
                        gamebananaModId: input.gamebananaModId,
                        timeCreatedGamebanana: input.timeCreatedGamebanana,
                        timeSubmitted: currentTime,
                        User_SubmittedBy: { connect: { id: ctx.user.id } },
                    },
                    select: defaultModSelect,
                });
            }


            return mod;
        }),

    approveEdit: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            throw new Error("Not implemented");
        }),

    rejectEdit: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            throw new Error("Not implemented");
        }),

    restore: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            //TODO: use id to select specific Mod_Archive, update live mod with data from Mod_Archive, delete Mod_Archive
            //only affects the mod, not the maps

            throw new Error("Not implemented");
        }),

    deleteArchiveMod: adminProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById("Mod_Archive", "mod", false, false, ctx.prisma, input.id);  //check that id matches an existing mod

            await ctx.prisma.mod_Archive.delete({ where: { id: input.id } });

            return true;
        }),

    deleteMod_total: adminProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const modFromId = await getModById("Mod", "mod", false, false, ctx.prisma, input.id);  //check that id matches an existing mod

            await ctx.prisma.mod.delete({ where: { id: input.id } });   //the deletion should cascade to any maps


            const archivedModsToDelete = await ctx.prisma.mod_Archive.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                archivedModsToDelete.map(
                    (archivedMod) => {
                        return ctx.prisma.mod_Archive.delete({ where: { id: archivedMod.id } });    //the deletion should cascade to any archivedMaps
                    },
                ),
            );


            const modEditsToDelete = await ctx.prisma.mod_Edit.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                modEditsToDelete.map(
                    (modEdit) => {
                        return ctx.prisma.mod_Edit.delete({ where: { id: modEdit.id } });   //the deletion should cascade to any mapEdits
                    },
                ),
            );


            const newModsToDelete = await ctx.prisma.mod_New.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                newModsToDelete.map(
                    (newMod) => {
                        return ctx.prisma.mod_New.delete({ where: { id: newMod.id } });   //the deletion should cascade to any newMaps
                    },
                ),
            );


            return true;
        }),
});
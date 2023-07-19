import { z } from "zod";
import axios from "axios";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure, modlistModeratorProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, ModType, Mod, Mod_Archive, Mod_Edit, Mod_New } from "@prisma/client";
import { getCombinedSchema, getOrderObjectArray } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { MODLIST_MODERATOR_PERMISSION_STRINGS, checkPermissions } from "../../utils/permissions";
import { mapPostWithModSchema, MapperUserId, modIdSchema_NonObject } from "./map";
import { PUBLISHER_NAME_MAX_LENGTH } from "./publisher";
import { getCurrentTime } from "../../utils/getCurrentTime";
import { selectIdObject } from "../../utils/selectIdObject";
import { IfElse } from "../../../../utils/typeHelpers";
import { getCheckedTableNames } from "../../utils/getCheckedTableNames";




type IdObjectArray = { id: number; }[];

type ExpandedMod = Mod & {
    Map: IdObjectArray;
    Review: IdObjectArray;
    Mod_Archive: IdObjectArray;
    Mod_Edit: IdObjectArray;
    Map_NewSolo: IdObjectArray;
};
type ExpandedModArchive = Mod_Archive;
type ExpandedModEdit = Mod_Edit;
type ExpandedModNew = Mod_New & { Map_NewWithMod_New: IdObjectArray; };

export type TrimmedMod = Omit<ExpandedMod, "submittedBy" | "approvedBy">;   //TODO: remove export when no longer used in "~/types/types.ts"
type TrimmedModArchive = Omit<ExpandedModArchive, "submittedBy" | "approvedBy">;
type TrimmedModEdit = Omit<ExpandedModEdit, "submittedBy">;
type TrimmedModNew = Omit<ExpandedModNew, "submittedBy">;




const includeModConnectionsObject = {
    Map: selectIdObject,
    Review: selectIdObject,
    Mod_Archive: selectIdObject,
    Mod_Edit: selectIdObject,
    Map_NewSolo: selectIdObject,
};


const includeModNewConnectionsObject = {
    Map_NewWithMod_New: selectIdObject,
};




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
    ...includeModConnectionsObject,
});


const defaultModArchiveSelect = Prisma.validator<Prisma.Mod_ArchiveSelect>()({
    ...baseModSelectObject,
    modId: true,
    timeApproved: true,
    timeArchived: true,
});


const defaultModEditSelect = Prisma.validator<Prisma.Mod_EditSelect>()({
    ...baseModSelectObject,
    modId: true,
});


const defaultModNewSelect = Prisma.validator<Prisma.Mod_NewSelect>()({
    ...baseModSelectObject,
    ...includeModNewConnectionsObject,
});




const MOD_NAME_MAX_LENGTH = 200;

const modNameSchema_NonObject = z.string().min(1).max(MOD_NAME_MAX_LENGTH);

const modNotesSchema_NonObject = z.string().min(1).max(500);

const modShortDescriptionSchema_NonObject = z.string().min(1).max(150);

const modLongDescriptionSchema_NonObject = z.string().min(1).max(1500);


const gamebananaModIdSchema_NonObject = z.number().int().gte(1).lte(INT_MAX_SIZES.mediumInt.unsigned);

const gamebananaModIdSchema = z.object({
    gamebananaModId: gamebananaModIdSchema_NonObject,
}).strict();


const modIdSchema = z.object({
    id: modIdSchema_NonObject,
}).strict();


const modTypeSchema_NonObject = z.enum(getNonEmptyArray(ModType));


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


const modTableNameArray = getCheckedTableNames(["Mod", "Mod_Archive", "Mod_Edit", "Mod_New"]);

const modTableNameSchema = z.object({
    tableName: z.enum(modTableNameArray)
}).strict();

type ModTableName = typeof modTableNameArray[number];




type ModUnion<
    TableName extends ModTableName,
    ReturnAll extends boolean
> = (
    TableName extends "Mod" ? IfElse<ReturnAll, ExpandedMod, TrimmedMod> :
    (
        TableName extends "Mod_Archive" ? IfElse<ReturnAll, ExpandedModArchive, TrimmedModArchive> :
        (
            TableName extends "Mod_Edit" ? IfElse<ReturnAll, ExpandedModEdit, TrimmedModEdit> :
            (
                TableName extends "Mod_New" ? IfElse<ReturnAll, ExpandedModNew, TrimmedModNew> :
                never
            )
        )
    )
) | null;


export const getModById = async<
    TableName extends ModTableName,
    IdType extends "mod" | "gamebanana",
    ReturnAll extends boolean,
    ThrowOnMatch extends boolean,
    Union extends ModUnion<TableName, ReturnAll>,
    ReturnType extends (
        ThrowOnMatch extends true ? void : NonNullable<Union>
    ),
>(
    tableName: TableName,
    idType: IdType,
    returnAll: ReturnAll,
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    id: number,
    customErrorMessage?: string,
): Promise<ReturnType> => {
    const idObject = { id: id };
    const whereObject = idType === "mod" ? idObject : { gamebananaModId: id };
    const invalidTableNameError = new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: customErrorMessage ?? `Invalid table name "${tableName}"`,
    });


    let mod: Union;

    if (returnAll) {
        switch (tableName) {
            case "Mod": {
                mod = await prisma.mod.findUnique({
                    where: whereObject,
                    include: includeModConnectionsObject,
                }) as Union;
                break;
            }
            case "Mod_Archive": {
                mod = await prisma.mod_Archive.findUnique({
                    where: idObject,
                    include: undefined,
                }) as Union;
                break;
            }
            case "Mod_Edit": {
                mod = await prisma.mod_Edit.findUnique({
                    where: idObject,
                    include: undefined,
                }) as Union;
                break;
            }
            case "Mod_New": {
                mod = await prisma.mod_New.findUnique({
                    where: whereObject,
                    include: includeModNewConnectionsObject,
                }) as Union;
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }
    else {
        switch (tableName) {
            case "Mod": {
                mod = await prisma.mod.findUnique({
                    where: whereObject,
                    select: defaultModSelect,
                }) as Union;
                break;
            }
            case "Mod_Archive": {
                mod = await prisma.mod_Archive.findUnique({
                    where: idObject,
                    select: defaultModArchiveSelect,
                }) as Union;
                break;
            }
            case "Mod_Edit": {
                mod = await prisma.mod_Edit.findUnique({
                    where: idObject,
                    select: defaultModEditSelect,
                }) as Union;
                break;
            }
            case "Mod_New": {
                mod = await prisma.mod_New.findUnique({
                    where: whereObject,
                    select: defaultModNewSelect,
                }) as Union;
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
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
                message: customErrorMessage ?? `No mod exists in table "${tableName}" with ${idType}Id "${id}"`,
            });
        }


        return mod as ReturnType;
    }
};




const getModByName = async<
    TableName extends ModTableName,
    ReturnAll extends boolean,
    Union extends ModUnion<TableName, ReturnAll>,
    ReturnType extends NonNullable<Union>[],
>(
    tableName: TableName,
    returnAll: ReturnAll,
    prisma: MyPrismaClient,
    query: string,
    customErrorMessage?: string,
): Promise<ReturnType> => {
    const whereObject: Prisma.ModWhereInput = { name: { contains: query } };


    const invalidTableNameError = new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: customErrorMessage ?? `Invalid table name "${tableName}"`,
    });


    let mods: Union[];

    if (returnAll) {
        switch (tableName) {
            case "Mod": {
                mods = await prisma.mod.findMany({
                    where: whereObject,
                    include: includeModConnectionsObject,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_Archive": {
                mods = await prisma.mod_Archive.findMany({
                    where: whereObject,
                    include: undefined,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_Edit": {
                mods = await prisma.mod_Edit.findMany({
                    where: whereObject,
                    include: undefined,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_New": {
                mods = await prisma.mod_New.findMany({
                    where: whereObject,
                    include: includeModNewConnectionsObject,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }
    else {
        switch (tableName) {
            case "Mod": {
                mods = await prisma.mod.findMany({
                    where: whereObject,
                    select: defaultModSelect,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_Archive": {
                mods = await prisma.mod_Archive.findMany({
                    where: whereObject,
                    select: defaultModArchiveSelect,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_Edit": {
                mods = await prisma.mod_Edit.findMany({
                    where: whereObject,
                    select: defaultModEditSelect,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            case "Mod_New": {
                mods = await prisma.mod_New.findMany({
                    where: whereObject,
                    select: defaultModNewSelect,
                }) as unknown as ReturnType;    //TODO!: figure out if this is safe and if it can be removed
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }


    return mods as ReturnType;
};




type GamebananaModInfo = {
    publisherGamebananaId: number,
    publisherName: string,
    timeCreatedGamebanana: number,
    gamebananaModName: string,
};


const getGamebananaModInfo = async (gamebananaModID: number): Promise<GamebananaModInfo> => {
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
};




type UpdateGamebananaModIdObject = {
    name: string,
    gamebananaModId: number,
    timeCreatedGamebanana: number,
    Publisher: Prisma.PublisherCreateNestedOneWithoutModInput,
};


const getUpdateGamebananaModIdObject = async (newGamebananaModId: number): Promise<UpdateGamebananaModIdObject> => {
    const gamebananaModInfo = await getGamebananaModInfo(newGamebananaModId);


    return {
        name: gamebananaModInfo.gamebananaModName,
        gamebananaModId: newGamebananaModId,
        timeCreatedGamebanana: gamebananaModInfo.timeCreatedGamebanana,
        Publisher: {
            connectOrCreate: {
                where: { gamebananaId: gamebananaModInfo.publisherGamebananaId },
                create: {
                    name: gamebananaModInfo.publisherName,
                    gamebananaId: gamebananaModInfo.publisherGamebananaId,
                },
            },
        },
    };
};




export const modRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(modOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.mod.findMany({
                select: defaultModSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
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
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return mods;
        }),

    getById: publicProcedure
        .input(modIdSchema.merge(modTableNameSchema.partial()))
        .query(async ({ ctx, input }) => {
            return await getModById(input.tableName ?? "Mod", "mod", false, false, ctx.prisma, input.id);
        }),

    getByGamebananaModId: publicProcedure
        .input(gamebananaModIdSchema.merge(modTableNameSchema.partial()))
        .query(async ({ ctx, input }) => {
            return await getModById(input.tableName ?? "Mod", "gamebanana", false, false, ctx.prisma, input.gamebananaModId);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: modNameSchema_NonObject,
            }).strict()
                .merge(modTableNameSchema.partial())
                .merge(modOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            return await getModByName(input.tableName ?? "Mod", false, ctx.prisma, input.query, `No mod exists in table "${input.tableName}" with a name matching "${input.query}"`);
        }),

    add: loggedInProcedure
        .input(modPostSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById("Mod", "gamebanana", false, true, ctx.prisma, input.gamebananaModId);     //check that the new mod won't conflict with an existing one


            const gamebananaModInfo = await getGamebananaModInfo(input.gamebananaModId);


            const currentTime = getCurrentTime();


            let mod: (Omit<ExpandedMod, "Map"> & { Map: { id: number; }[]; }) | TrimmedModNew;

            const modCreateData_base: Prisma.ModCreateInput | Prisma.Mod_NewCreateInput = {
                type: input.type,
                name: gamebananaModInfo.gamebananaModName,
                contentWarning: input.contentWarning,
                notes: input.notes,
                shortDescription: input.shortDescription,
                longDescription: input.longDescription,
                gamebananaModId: input.gamebananaModId,
                timeSubmitted: currentTime,
                User_SubmittedBy: { connect: { id: ctx.user.id } },
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


            const mapCreateDataArray_base: (Prisma.MapCreateWithoutModInput & MapperUserId)[] | (Prisma.Map_NewWithMod_NewCreateWithoutMod_NewInput & MapperUserId)[] = input.maps.map((map) => {
                return {
                    User_MapperUser: "mapperUserId" in map ? { connect: { id: map.mapperUserId ?? undefined } } : undefined,
                    mapperNameString: ("mapperNameString" in map ? map.mapperNameString : undefined) ?? gamebananaModInfo.publisherName,
                    name: map.name,
                    description: map.description,
                    notes: map.notes,
                    chapter: "chapter" in map ? map.chapter : undefined,
                    side: "side" in map ? map.side : undefined,
                    overallRank: "overallRank" in map ? map.overallRank : undefined,
                    mapRemovedFromModBool: map.mapRemovedFromModBool,
                    timeSubmitted: currentTime,
                    User_SubmittedBy: { connect: { id: ctx.user.id } },
                    Difficulty: { connect: { id: map.canonicalDifficultyId } },
                    Length: { connect: { id: map.lengthId } },
                };
            });


            if (checkPermissions(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user.permissions)) {
                const mapCreateDataArray_approved: Prisma.MapCreateWithoutModInput[] = mapCreateDataArray_base.map((map) => {
                    return {
                        ...map,
                        timeApproved: currentTime,
                        user_map_approvedByTouser: { connect: { id: ctx.user.id } },
                    };
                });


                mod = await ctx.prisma.mod.create({
                    data: {
                        ...modCreateData_base,
                        timeApproved: currentTime,
                        User_ApprovedBy: { connect: { id: ctx.user.id } },
                        Map: { create: mapCreateDataArray_approved },
                    },
                    include: includeModConnectionsObject    //use include instead of select so that other Mod properties are still returned
                });


                await ctx.prisma.mod_New.deleteMany({ where: { gamebananaModId: input.gamebananaModId } });     //if the same mod has already been submitted, delete the unapproved submission
            }
            else {
                await getModById(
                    "Mod_New", "gamebanana", false, true, ctx.prisma, input.gamebananaModId, "A mod with this gamebanana id has already been submitted"
                );     //check that the new mod hasn't already been submitted


                mod = await ctx.prisma.mod_New.create({
                    data: {
                        ...modCreateData_base,
                        Map_NewWithMod_New: { create: mapCreateDataArray_base },
                    },
                    select: {
                        ...defaultModNewSelect,
                        Map_NewWithMod_New: selectIdObject,
                    },
                });
            }


            return mod;
        }),

    approveNew: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const newMod = await ctx.prisma.mod_New.findUnique({
                where: { id: input.id },
                include: { Map_NewWithMod_New: true },
            });

            if (!newMod) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No mod exists in mod_New with id "${input.id}"`,
                });
            }


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
                        create: newMod.Map_NewWithMod_New.map(
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
                include: {  //use include instead of select so that other Mod properties are still returned
                    Map: selectIdObject,
                },
            });


            await ctx.prisma.mod_New.delete({ where: { id: input.id } });    //the deletion should cascade to any NewMaps


            return approvedMod;
        }),

    rejectNew: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById("Mod_New", "mod", false, false, ctx.prisma, input.id);

            await ctx.prisma.mod_New.delete({ where: { id: input.id } });    //the deletion should cascade to any NewMaps

            return true;
        }),

    update: loggedInProcedure
        .input(modPostSchema.partial().merge(modIdSchema).merge(z.object({
            longDescription: z.string().nullish(),  //null = set to null in db, undefined = don't change
        })))
        .mutation(async ({ ctx, input }) => {
            const existingMod = await getModById("Mod", "mod", true, false, ctx.prisma, input.id);  //check that the mod exists

            if (input.gamebananaModId) {
                await getModById(
                    "Mod", "gamebanana", false, true, ctx.prisma, input.gamebananaModId, "A mod with this gamebanana id has already been submitted"
                );     //check that the new mod doesn't already exist
            }


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


                let modUpdateData: Prisma.ModUpdateInput = {
                    type: input.type,
                    name: existingMod.name,
                    Publisher: { connect: { id: existingMod.publisherId } },
                    contentWarning: input.contentWarning,
                    notes: input.notes,
                    shortDescription: input.shortDescription,
                    longDescription: input.longDescription,
                    gamebananaModId: input.gamebananaModId,
                    timeSubmitted: currentTime,
                    User_SubmittedBy: { connect: { id: ctx.user.id } },
                    timeApproved: currentTime,
                    User_ApprovedBy: { connect: { id: ctx.user.id } },
                    timeCreatedGamebanana: existingMod.timeCreatedGamebanana,
                };


                if (input.gamebananaModId && input.gamebananaModId !== existingMod.gamebananaModId) {
                    const updateGamebananaModIdObject = await getUpdateGamebananaModIdObject(input.gamebananaModId);

                    modUpdateData = {
                        ...modUpdateData,
                        ...updateGamebananaModIdObject,
                    };
                }


                mod = await ctx.prisma.mod.update({
                    where: { id: input.id },
                    data: modUpdateData,
                    select: defaultModSelect,
                });
            }
            else {
                let modEditCreateData: Prisma.Mod_EditCreateInput = {
                    Mod: { connect: { id: existingMod.id } },
                    type: input.type,
                    name: existingMod.name,
                    Publisher: { connect: { id: existingMod.publisherId } },
                    contentWarning: input.contentWarning,
                    notes: input.notes,
                    shortDescription: input.shortDescription ?? existingMod.shortDescription,
                    longDescription: input.longDescription === undefined ? existingMod.longDescription : input.longDescription, //null = set to null in db, undefined = don't change
                    gamebananaModId: existingMod.gamebananaModId,
                    timeCreatedGamebanana: existingMod.timeCreatedGamebanana,
                    timeSubmitted: currentTime,
                    User_SubmittedBy: { connect: { id: ctx.user.id } },
                };


                if (input.gamebananaModId && input.gamebananaModId !== existingMod.gamebananaModId) {
                    const updateGamebananaModIdObject = await getUpdateGamebananaModIdObject(input.gamebananaModId);

                    modEditCreateData = {
                        ...modEditCreateData,
                        ...updateGamebananaModIdObject,
                    };
                }


                mod = await ctx.prisma.mod_Edit.create({
                    data: modEditCreateData,
                    select: defaultModSelect,
                });
            }


            return mod;
        }),

    approveEdit: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            const modEdit = await getModById("Mod_Edit", "mod", true, false, ctx.prisma, input.id);  //check that the ModEdit exists
            const existingMod = await getModById("Mod", "mod", true, false, ctx.prisma, modEdit.modId);  //check that the mod exists


            const currentTime = getCurrentTime();


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


            const updatedMod = await ctx.prisma.mod.update({
                where: { id: existingMod.id },
                data: {
                    type: modEdit.type,
                    name: modEdit.name,
                    Publisher: { connect: { id: modEdit.publisherId } },
                    contentWarning: modEdit.contentWarning,
                    notes: modEdit.notes,
                    shortDescription: modEdit.shortDescription,
                    longDescription: modEdit.longDescription,
                    gamebananaModId: modEdit.gamebananaModId,
                    timeSubmitted: modEdit.timeSubmitted,
                    User_SubmittedBy: 
                        modEdit.submittedBy === null ?
                        { disconnect: true } :
                        { connect: { id: modEdit.submittedBy } },
                    timeApproved: currentTime,
                    User_ApprovedBy: { connect: { id: ctx.user.id } },
                    timeCreatedGamebanana: modEdit.timeCreatedGamebanana,
                },
                //this procedure is moderator only, so we can return everything
            });


            await ctx.prisma.mod_Edit.delete({ where: { id: input.id } });  //this deletion has nothing to cascade to. ModEdits are never connected to MapEdits.


            return updatedMod;
        }),

    rejectEdit: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getModById("Mod_New", "mod", false, false, ctx.prisma, input.id);

            await ctx.prisma.mod_Edit.delete({ where: { id: input.id } });  //this deletion has nothing to cascade to. ModEdits are never connected to MapEdits.

            return true;
        }),

    restore: modlistModeratorProcedure
        .input(modIdSchema)
        .mutation(async ({ ctx, input }) => {
            //only affects the mod, not the maps

            const modArchive = await getModById("Mod_Archive", "mod", true, false, ctx.prisma, input.id);  //check that the ModArchive exists


            const updatedMod = await ctx.prisma.mod.update({
                where: { id: modArchive.modId },
                data: {
                    type: modArchive.type,
                    name: modArchive.name,
                    Publisher: { connect: { id: modArchive.publisherId } },
                    contentWarning: modArchive.contentWarning,
                    notes: modArchive.notes,
                    shortDescription: modArchive.shortDescription,
                    longDescription: modArchive.longDescription,
                    gamebananaModId: modArchive.gamebananaModId,
                    timeSubmitted: modArchive.timeSubmitted,
                    User_SubmittedBy: { connect: { id: modArchive.submittedBy ?? undefined } },
                    timeApproved: modArchive.timeApproved,
                    User_ApprovedBy: { connect: { id: modArchive.approvedBy ?? undefined } },
                    timeCreatedGamebanana: modArchive.timeCreatedGamebanana,
                },
                //this procedure is moderator only, so we can return everything
            });


            await ctx.prisma.mod_Archive.delete({ where: { id: input.id } });  //this deletion has nothing to cascade to. ModArchives are never connected to MapArchives.


            return updatedMod;
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

            await ctx.prisma.mod.delete({ where: { id: input.id } });   //the deletion should cascade to any maps, mapEdits, mapArchives, mapNewSolos, modEdits, and modArchives


            const archivedModsToDelete = await ctx.prisma.mod_Archive.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                archivedModsToDelete.map(
                    (archivedMod) => {
                        return ctx.prisma.mod_Archive.delete({ where: { id: archivedMod.id } });    //this deletion has nothing to cascade to. ModArchives are never connected to MapArchives.
                    },
                ),
            );

            if (archivedModsToDelete.length) console.log(`Deleted mod had ArchivedMods with the same GamebananaModId. This should never happen.`);


            const modEditsToDelete = await ctx.prisma.mod_Edit.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                modEditsToDelete.map(
                    (modEdit) => {
                        return ctx.prisma.mod_Edit.delete({ where: { id: modEdit.id } });   //this deletion has nothing to cascade to. ModEdits are never connected to MapEdits.
                    },
                ),
            );

            if (modEditsToDelete.length) console.log(`Deleted mod had ModEdits with the same GamebananaModId. This should never happen.`);


            const newModsToDelete = await ctx.prisma.mod_New.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                newModsToDelete.map(
                    (newMod) => {
                        return ctx.prisma.mod_New.delete({ where: { id: newMod.id } });   //the deletion should cascade to any newMaps
                    },
                ),
            );

            if (newModsToDelete.length) console.log(`Deleted mod had NewMods with the same GamebananaModId. This should never happen.`);


            return true;
        }),
});
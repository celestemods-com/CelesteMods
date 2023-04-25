import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure, modlistModeratorProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Map, MapSide, Map_NewWithMod_New, Map_Edit, Map_Archive, Map_NewSolo } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { displayNameSchema_NonObject, getUserById, userIdSchema_NonObject } from "../user";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged, checkPermissions } from "../../utils/permissions";
import { getModById, modIdSchema_NonObject } from "./mod";
import { difficultyIdSchema_NonObject } from "../difficulty";
import { lengthIdSchema_NonObject } from "../length";
import { techIdSchema_NonObject } from "../tech_techVideo/tech";
import { IfElse, ArrayIncludes } from "../../../../utils/typeHelpers";
import { getCurrentTime } from "../../utils/getCurrentTime";
import { getCheckedTableNames } from "../../utils/getCheckedTableNames";
import { checkSubarray, CheckSubarray } from "~/utils/checkSubarray";
import { getPublisherById } from "./publisher";

//TODO!: check all routers to make sure disconnect/connect or set are used in any many-to-many relationships




type TrimmedMap = Omit<Map, "submittedBy" | "approvedBy">;
type TrimmedMapArchive = Omit<Map_Archive, "submittedBy" | "approvedBy">;
type TrimmedMapEdit = Omit<Map_Edit, "submittedBy">;
type TrimmedMapNewWithModNew = Omit<Map_NewWithMod_New, "submittedBy">;
type TrimmedMapNewSolo = Omit<Map_NewSolo, "submittedBy">;


type MapToTechRelation = { techId: number, fullClearOnlyBool: boolean; }[];

type ExpandedMap = Map & { MapsToTechs: MapToTechRelation; };
type ExpandedMapArchive = Map_Archive & { Map_ArchivesToTechs: MapToTechRelation; };
type ExpandedMapEdit = Map_Edit & { Map_EditsToTechs: MapToTechRelation; };
type ExpandedMapNewWithModNew = Map_NewWithMod_New & { Map_NewWithMod_NewToTechs: MapToTechRelation; };
type ExpandedMapNewSolo = Map_NewSolo & { Map_NewSoloToTechs: MapToTechRelation; };




const includeObject = {
    select: {
        techId: true,
        fullClearOnlyBool: true,
    }
};




const baseMapSelectObject = {
    id: true,
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
};


const defaultMapSelect = Prisma.validator<Prisma.MapSelect>()({
    ...baseMapSelectObject,
    modId: true,
    timeApproved: true,
    MapsToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
    ReviewMap: { select: { id: true } },
    Map_Archive: { select: { id: true } },
    Map_Edit: { select: { id: true } },
});


const defaultMapArchiveSelect = Prisma.validator<Prisma.Map_ArchiveSelect>()({
    ...baseMapSelectObject,
    mapId: true,
    timeApproved: true,
    timeArchived: true,
    Map_ArchivesToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
});


const defaultMapEditSelect = Prisma.validator<Prisma.Map_EditSelect>()({
    ...baseMapSelectObject,
    mapId: true,
    Map_EditsToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
});


const defaultMapNewWithModNewSelect = Prisma.validator<Prisma.Map_NewWithMod_NewSelect>()({
    ...baseMapSelectObject,
    mod_NewId: true,
    Map_NewWithMod_NewToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
});


const defaultMapNewSoloSelect = Prisma.validator<Prisma.Map_NewSoloSelect>()({
    ...baseMapSelectObject,
    modId: true,
    Map_NewSoloToTechs: {
        select: {
            techId: true,
            fullClearOnlyBool: true,
        },
    },
});




const mapNameSchema_NonObject = z.string().min(1).max(200).trim();      //TODO: check that trim works here. if it does, put it in all* other string schemas

const mapDescriptionSchema_NonObject = z.string().min(1).max(500).trim();

const mapNotesSchema_NonObject = z.string().min(1).max(500).trim();


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
    mapperUserId: userIdSchema_NonObject.nullish(),
    mapperNameString: displayNameSchema_NonObject.nullish(), /** Set to null to indicate the mod's publisher's name should be used */
    overallRank: z.number().int().min(1).max(intMaxSizes.tinyInt.unsigned),
}).strict();

const refineCollabContestLobby = (data: any) => {   //TODO: add type for data
    if (data.mapperUserId && data.mapperNameString) return false;

    if (data.mapperUserId || data.mapperNameString !== undefined) return true;

    return false;
};


const modIdForMapSchema = z.object({
    modId: modIdSchema_NonObject,
}).strict();

export const mapPostWithModSchema = z.union([
    mapSchema_Normal,
    mapSchema_Collab_Contest_Lobby.refine(refineCollabContestLobby),
]);

const mapSoloPostSchema = z.union([
    mapSchema_Normal.merge(modIdForMapSchema),
    mapSchema_Collab_Contest_Lobby.merge(modIdForMapSchema).refine(refineCollabContestLobby),
]);


const mapUpdateSchema_Normal = mapSchema_Normal.partial().merge(mapIdSchema);
const mapUpdateSchema_Collab_Contest_Lobby = mapSchema_Collab_Contest_Lobby.partial().merge(mapIdSchema);

const mapUpdateSchema = z.union([
    mapUpdateSchema_Normal,
    mapUpdateSchema_Collab_Contest_Lobby,
]);


export const mapOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.MapScalarFieldEnum),
    ["modId", "mapRemovedFromModBool", "chapter", "side", "overallRank", "mapperNameString", "id"],
    ["asc"],
);


const mapTableNameArray = getCheckedTableNames(["Map", "Map_Archive", "Map_Edit", "Map_NewWithMod_New", "Map_NewSolo"]);

const mapTableNameSchema = z.object({
    tableName: z.enum(mapTableNameArray)
}).strict();

type MapTableName = typeof mapTableNameArray[number];




type MapUnion<
    TableName extends MapTableName,
    ReturnAll extends boolean
> = (
    TableName extends "Map" ? IfElse<ReturnAll, ExpandedMap, TrimmedMap> :
    (
        TableName extends "Map_Archive" ? IfElse<ReturnAll, ExpandedMapArchive, TrimmedMapArchive> :
        (
            TableName extends "Map_Edit" ? IfElse<ReturnAll, ExpandedMapEdit, TrimmedMapEdit> :
            (
                TableName extends "Map_NewWithMod_New" ? IfElse<ReturnAll, ExpandedMapNewWithModNew, TrimmedMapNewWithModNew> :
                (
                    TableName extends "Map_NewSolo" ? IfElse<ReturnAll, ExpandedMapNewSolo, TrimmedMapNewSolo> :
                    never
                )
            )
        )
    )
) | null;


export const getMapById = async<
    TableName extends MapTableName,
    ReturnAll extends boolean,
    ThrowOnMatch extends boolean,
    Union extends MapUnion<TableName, ReturnAll>,
    ReturnType extends (
        ThrowOnMatch extends true ? void : NonNullable<Union>
    ),
>(
    tableName: TableName,
    returnAll: ReturnAll,
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    id: number,
    customErrorMessage?: string,
): Promise<ReturnType> => {
    const whereObject: Prisma.MapWhereUniqueInput = { id: id };


    const invalidTableNameError = new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: customErrorMessage ?? `Invalid table name "${tableName}"`,
    });


    let map: Union;

    if (returnAll) {
        switch (tableName) {
            case "Map": {
                map = await prisma.map.findUnique({
                    where: whereObject,
                    include: { MapsToTechs: includeObject },
                }) as Union;
                break;
            }
            case "Map_Archive": {
                map = await prisma.map_Archive.findUnique({
                    where: whereObject,
                    include: { Map_ArchivesToTechs: includeObject },
                }) as Union;
                break;
            }
            case "Map_Edit": {
                map = await prisma.map_Edit.findUnique({
                    where: whereObject,
                    include: { Map_EditsToTechs: includeObject },
                }) as Union;
                break;
            }
            case "Map_NewWithMod_New": {
                map = await prisma.map_NewWithMod_New.findUnique({
                    where: whereObject,
                    include: { Map_NewWithMod_NewToTechs: includeObject },
                }) as Union;
                break;
            }
            case "Map_NewSolo": {
                map = await prisma.map_NewSolo.findUnique({
                    where: whereObject,
                    include: { Map_NewSoloToTechs: includeObject },
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
            case "Map": {
                map = await prisma.map.findUnique({
                    where: whereObject,
                    select: defaultMapSelect,
                }) as Union;
                break;
            }
            case "Map_Archive": {
                map = await prisma.map_Archive.findUnique({
                    where: whereObject,
                    select: defaultMapArchiveSelect,
                }) as Union;
                break;
            }
            case "Map_Edit": {
                map = await prisma.map_Edit.findUnique({
                    where: whereObject,
                    select: defaultMapEditSelect,
                }) as Union;
                break;
            }
            case "Map_NewWithMod_New": {
                map = await prisma.map_NewWithMod_New.findUnique({
                    where: whereObject,
                    select: defaultMapNewWithModNewSelect,
                }) as Union;
                break;
            }
            case "Map_NewSolo": {
                map = await prisma.map_NewSolo.findUnique({
                    where: whereObject,
                    select: defaultMapNewSoloSelect,
                }) as Union;
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }


    if (throwOnMatch) {
        if (map) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: customErrorMessage ?? `Conflicts with existing map ${id}`,
            });
        }

        return undefined as ReturnType;
    }
    else {
        if (!map) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: customErrorMessage ?? `No map exists in table "${tableName}" with id "${id}"`,
            });
        }


        return map as ReturnType;
    }
};




type ExactMatchMapTableNames = ArrayIncludes<"Map" | "Map_New", typeof mapTableNameArray>;

const getMapByName = async<
    TableName extends MapTableName,
    ReturnAll extends boolean,
    ThrowOnMatch extends boolean,
    ExactMatch extends (
        TableName extends ExactMatchMapTableNames ? boolean : undefined
    ),
    ModId extends (
        ExactMatch extends true ? number : undefined
    ),
    Union extends MapUnion<TableName, ReturnAll>,
    ReturnType extends (
        ThrowOnMatch extends true ? void : NonNullable<Union>[]
    ),
>(
    tableName: TableName,
    returnAll: ReturnAll,
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    query: string,
    exactMatch?: ExactMatch,
    modId?: ModId,
    customErrorMessage?: string,
): Promise<ReturnType> => {
    const whereObject: Prisma.MapWhereInput = exactMatch ?
        {
            [tableName === "Map" ? "modId" : "mod_newId"]: modId,
            name: { equals: query }
        } :
        {
            name: { contains: query }
        };


    const invalidTableNameError = new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: customErrorMessage ?? `Invalid table name "${tableName}"`,
    });


    let maps: Union[];

    if (returnAll) {
        switch (tableName) {
            case "Map": {
                maps = await prisma.map.findMany({
                    where: whereObject,
                    include: { MapsToTechs: includeObject },
                }) as Union[];
                break;
            }
            case "Map_Archive": {
                maps = await prisma.map_Archive.findMany({
                    where: whereObject,
                    include: { Map_ArchivesToTechs: includeObject },
                }) as Union[];
                break;
            }
            case "Map_Edit": {
                maps = await prisma.map_Edit.findMany({
                    where: whereObject,
                    include: { Map_EditsToTechs: includeObject },
                }) as Union[];
                break;
            }
            case "Map_NewWithMod_New": {
                maps = await prisma.map_NewWithMod_New.findMany({
                    where: whereObject,
                    include: { Map_NewWithMod_NewToTechs: includeObject },
                }) as Union[];
                break;
            }
            case "Map_NewSolo": {
                maps = await prisma.map_NewSolo.findMany({
                    where: whereObject,
                    include: { Map_NewSoloToTechs: includeObject },
                }) as Union[];
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }
    else {
        switch (tableName) {
            case "Map": {
                maps = await prisma.map.findMany({
                    where: whereObject,
                    select: defaultMapSelect,
                }) as unknown as Union[];   //TODO: attempt to fix this. why is this the only case where this is needed?
                break;
            }
            case "Map_Archive": {
                maps = await prisma.map_Archive.findMany({
                    where: whereObject,
                    select: defaultMapArchiveSelect,
                }) as Union[];
                break;
            }
            case "Map_Edit": {
                maps = await prisma.map_Edit.findMany({
                    where: whereObject,
                    select: defaultMapEditSelect,
                }) as Union[];
                break;
            }
            case "Map_NewWithMod_New": {
                maps = await prisma.map_NewWithMod_New.findMany({
                    where: whereObject,
                    select: defaultMapNewWithModNewSelect,
                }) as Union[];
                break;
            }
            case "Map_NewSolo": {
                maps = await prisma.map_NewSolo.findMany({
                    where: whereObject,
                    select: defaultMapNewSoloSelect,
                }) as Union[];
                break;
            }
            default: {
                throw invalidTableNameError;
            }
        }
    }


    if (throwOnMatch) {
        if (maps.length) {
            if (maps[0]) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: customErrorMessage ?? `Conflicts with existing map ${maps[0].id}`,
                });
            }
            else {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "maps[0] is undefined. Please contact an admin.",
                });
            }
        }

        return undefined as ReturnType;
    }
    else {
        if (!maps.length) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: customErrorMessage ?? `No map exists in table "${tableName}" with ${exactMatch ? "name" : "name containing"} "${query}" connected to ${tableName} "${modId}"`,
            });
        }


        return maps as ReturnType;
    }
};




const getTechConnectObject = (input: z.infer<typeof mapSoloPostSchema> | z.infer<typeof mapUpdateSchema>): Prisma.MapsToTechsCreateWithoutMapInput[] => {
    const techConnectObject: Prisma.MapsToTechsCreateWithoutMapInput[] = [];


    input.techAnyIds?.forEach((techId) => {
        techConnectObject.push({
            fullClearOnlyBool: false,
            Tech: { connect: { id: techId } },
        });
    });

    input.techFullClearIds?.forEach((techId) => {
        techConnectObject.push({
            fullClearOnlyBool: true,
            Tech: { connect: { id: techId } },
        });
    });


    return techConnectObject;
};




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
        .input(mapIdSchema.merge(mapTableNameSchema.partial()))
        .query(async ({ ctx, input }) => {
            return await getMapById(input.tableName ?? "Map", false, false, ctx.prisma, input.id);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: mapNameSchema_NonObject,
            }).strict()
                .merge(mapTableNameSchema.partial())
                .merge(mapOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            return await getMapByName(input.tableName ?? "Map", false, false, ctx.prisma, input.query);
        }),

    addSolo: loggedInProcedure
        .input(mapSoloPostSchema)
        .mutation(async ({ ctx, input }) => {
            await getMapByName("Map", false, true, ctx.prisma, input.name, true, input.modId);   //check that the map won't conflict with an existing one

            const modFromId = await getModById("Mod", "mod", false, false, ctx.prisma, input.modId);


            const currentTime = getCurrentTime();


            const techConnectObject = getTechConnectObject(input);


            const mapCreateData_base = {
                Mod: { connect: { id: input.modId } },
                name: input.name,
                Difficulty: { connect: { id: input.canonicalDifficultyId } },
                Length: { connect: { id: input.lengthId } },
                description: input.description,
                notes: input.notes,
                mapRemovedFromModBool: input.mapRemovedFromModBool,
                timeSubmitted: currentTime,
                User_SubmittedBy: { connect: { id: ctx.user.id } },
            };


            let mapCreateData: Prisma.MapCreateInput | Prisma.Map_NewSoloCreateInput;

            if (modFromId.type === "Normal") {
                if ("chapter" in input === false || "side" in input === false) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Chapter and side must be provided for normal mods. This should have been caught by the schema. Please contact an admin.",
                    });
                }

                const normalInput = input as z.infer<typeof mapSchema_Normal>;


                const publisherFromId = await getPublisherById(ctx.prisma, modFromId.publisherId);


                mapCreateData = {
                    ...mapCreateData_base,
                    mapperNameString: publisherFromId.name,
                    chapter: normalInput.chapter,
                    side: normalInput.side,
                };
            }
            else {
                if (
                    ("mapperUserId" in input === false && "mapperNameString" in input === false)
                ) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Mapper must be provided for NonNormal mods. This should have been caught by the schema. Please contact an admin.",
                    });
                }


                const nonNormalInput = input as z.infer<typeof mapSchema_Collab_Contest_Lobby>;


                let mapperNameString: string;

                if (nonNormalInput.mapperUserId) {
                    const userFromId = await getUserById(ctx.prisma, nonNormalInput.mapperUserId, undefined);

                    mapperNameString = userFromId.displayName;
                }
                else if (nonNormalInput.mapperNameString) {
                    mapperNameString = nonNormalInput.mapperNameString;
                }
                else if (nonNormalInput.mapperNameString === null) {
                    const publisherFromId = await getPublisherById(ctx.prisma, modFromId.publisherId);

                    mapperNameString = publisherFromId.name;
                }
                else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Unable to determine mapper name. Please contact an admin.",
                    });
                }


                mapCreateData = {
                    ...mapCreateData_base,
                    User_MapperUser: { connect: { id: nonNormalInput.mapperUserId ?? undefined } },
                    mapperNameString: mapperNameString,
                    overallRank: nonNormalInput.overallRank,
                };
            }

            let map: Map | TrimmedMapNewSolo;

            if (checkPermissions(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user.permissions)) {
                map = await ctx.prisma.map.create({
                    data: {
                        ...mapCreateData,
                        timeApproved: currentTime,
                        User_ApprovedBy: { connect: { id: ctx.user.id } },
                        MapsToTechs: { create: techConnectObject },
                    },
                });


                //don't need to check Map_NewWithMod_New because this procedure requires the mod to already exist, which means that any matching Mod_New would have been deleted along with any maps submitted with it.
                await ctx.prisma.map_NewSolo.deleteMany({
                    where: {        //TODO: confirm that this doesn't need to be wrapped in AND object
                        modId: input.modId,
                        name: input.name,
                    },
                });     //if the same map has already been submitted, delete the unapproved submission
            }
            else {
                await getMapByName(
                    "Map", false, true, ctx.prisma, input.name, true, input.modId, `A map with the name "${input.name}" has already been submitted for mod ${input.modId}`
                );     //check that the new mod hasn't already been submitted


                map = await ctx.prisma.map_NewSolo.create({
                    data: {
                        ...mapCreateData,
                        Map_NewSoloToTechs: { create: techConnectObject },
                    },
                });
            }


            return map;
        }),

    approveNewSolo: modlistModeratorProcedure
        .input(mapIdSchema)
        .mutation(async ({ ctx, input }) => {
            const newMap = await getMapById("Map_NewSolo", true, false, ctx.prisma, input.id);
            const linkedTechIds = await ctx.prisma.map_NewSoloToTechs.findMany({ where: { map_NewSoloId: newMap.id } });

            const currentTime = getCurrentTime();


            const techConnectObject: Prisma.MapsToTechsCreateWithoutMapInput[] = linkedTechIds.map(
                (techConnection) => ({
                    Tech: { connect: { id: techConnection.techId } },
                    fullClearOnlyBool: techConnection.fullClearOnlyBool,
                }),
            );


            const approvedMap = await ctx.prisma.map.create({
                data: {
                    Mod: { connect: { id: newMap.modId } },
                    User_MapperUser: { connect: { id: newMap.mapperUserId ?? undefined } },
                    mapperNameString: newMap.mapperNameString,
                    name: newMap.name,
                    Difficulty: { connect: { id: newMap.canonicalDifficultyId } },
                    Length: { connect: { id: newMap.lengthId } },
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
                    MapsToTechs: { create: techConnectObject },
                },
            });


            await ctx.prisma.map_NewSolo.delete({ where: { id: input.id } });


            return approvedMap;
        }),

    rejectNewSolo: modlistModeratorProcedure
        .input(mapIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getMapById("Map_NewSolo", false, false, ctx.prisma, input.id);    //check that the map exists

            await ctx.prisma.map_NewSolo.delete({ where: { id: input.id } });

            return true;
        }),

    update: loggedInProcedure
        .input(mapUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const existingMap = await getMapById("Map", true, false, ctx.prisma, input.id);  //check that the map exists

            const modFromId = await getModById("Mod", "mod", false, false, ctx.prisma, existingMap.modId);


            const currentTime = getCurrentTime();


            const techConnectObject = getTechConnectObject(input);


            const mapUpdateData_base = {
                name: input.name,
                Difficulty: { connect: { id: input.canonicalDifficultyId } },
                Length: { connect: { id: input.lengthId } },
                description: input.description,     //null = set to null in db, undefined = don't change
                notes: input.notes,
                timeSubmitted: currentTime,
                User_SubmittedBy: { connect: { id: ctx.user.id } },
            };


            let mapUpdateData: Prisma.MapUpdateInput | Prisma.Map_EditCreateInput;

            if (modFromId.type === "Normal") {
                const normalInput = input as z.infer<typeof mapUpdateSchema_Normal>;


                const publisherFromId = await getPublisherById(ctx.prisma, modFromId.publisherId);


                mapUpdateData = {
                    ...mapUpdateData_base,
                    mapperNameString: publisherFromId.name,
                    chapter: normalInput.chapter,
                    side: normalInput.side,
                };
            }
            else {
                const nonNormalInput = input as z.infer<typeof mapUpdateSchema_Collab_Contest_Lobby>;


                let mapperUserId: number | null | undefined;
                let mapperNameString: string;

                if (nonNormalInput.mapperUserId) {
                    const userFromId = await getUserById(ctx.prisma, nonNormalInput.mapperUserId, undefined);

                    mapperUserId = userFromId.id;
                    mapperNameString = userFromId.displayName;
                }
                else if (nonNormalInput.mapperUserId !== null && existingMap.mapperUserId) {
                    const userFromId = await getUserById(ctx.prisma, existingMap.mapperUserId, undefined);

                    mapperUserId = undefined;
                    mapperNameString = userFromId.displayName;
                }
                else {
                    if (nonNormalInput.mapperUserId === null) mapperUserId = null;
                    else mapperUserId = existingMap.mapperUserId;


                    if (nonNormalInput.mapperNameString) {
                        mapperNameString = nonNormalInput.mapperNameString;
                    }
                    else if (nonNormalInput.mapperNameString === null) {
                        const publisherFromId = await getPublisherById(ctx.prisma, modFromId.publisherId);

                        mapperNameString = publisherFromId.name;
                    }
                    else {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Unable to determine mapper name. Please contact an admin.",
                        });
                    }
                }


                mapUpdateData = {
                    ...mapUpdateData_base,
                    User_MapperUser:
                        mapperUserId === undefined ?
                            undefined :     //don't change
                            mapperUserId === null ?
                                { disconnect: true } :  //disconnect existing
                                { connect: { id: mapperUserId } },  //connect new   //disconnect not needed because there can only be 1 connection
                    mapperNameString: mapperNameString,
                    overallRank: nonNormalInput.overallRank,
                };
            }
            //TODO: continue here

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
                    User_SubmittedBy: { connect: { id: modEdit.submittedBy ?? undefined } },
                    timeApproved: currentTime,
                    User_ApprovedBy: { connect: { id: ctx.user.id } },
                    timeCreatedGamebanana: modEdit.timeCreatedGamebanana,
                },
                select: undefined,  //this procedure is moderator only, so we can return everything
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
            //TODO: use id to select specific ModArchive, update live mod with data from ModArchive, delete ModArchive
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
                select: undefined,  //this procedure is moderator only, so we can return everything
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

            await ctx.prisma.mod.delete({ where: { id: input.id } });   //the deletion should cascade to any maps


            const archivedModsToDelete = await ctx.prisma.mod_Archive.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                archivedModsToDelete.map(
                    (archivedMod) => {
                        return ctx.prisma.mod_Archive.delete({ where: { id: archivedMod.id } });    //this deletion has nothing to cascade to. ModArchives are never connected to MapArchives.
                    },
                ),
            );


            const modEditsToDelete = await ctx.prisma.mod_Edit.findMany({ where: { gamebananaModId: modFromId.gamebananaModId } });

            await Promise.all(
                modEditsToDelete.map(
                    (modEdit) => {
                        return ctx.prisma.mod_Edit.delete({ where: { id: modEdit.id } });   //this deletion has nothing to cascade to. ModEdits are never connected to MapEdits.
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

            if (newModsToDelete.length) console.log(`Deleted mod had NewMods with the same GamebananaModId. This should never happen.`);


            return true;
        }),
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, loggedInProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Rating } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { getMapById, mapIdSchema_NonObject } from "./map_mod_publisher/map";
import { qualityIdSchema_NonObject } from "./quality";
import { difficultyIdSchema_NonObject } from "./difficulty";
import { getCurrentTime } from "../utils/getCurrentTime";
import { ADMIN_PERMISSION_STRINGS, checkIsPrivileged } from "../utils/permissions";
import { getModById, modIdSchema_NonObject } from "./map_mod_publisher/mod";
import { userIdSchema_NonObject } from "./user";




type ValuesMap = Map<number, number>;  //Map with IDs as the keys and "values" as the values


type RatingsInfo = {
    averageQualityId: number | undefined;
    averageQualityValue: number | undefined;
    averageDifficultyId: number | undefined;
    averageDifficultyValue?: number;
    overallCount: number;
    qualityCount: number;
    difficultyCount: number;
};




export const ratingIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.int.unsigned);

const ratingIdSchema = z.object({
    id: ratingIdSchema_NonObject,
}).strict();


const refineRating = (data: any): boolean => {  //TODO: add type for data
    if (data.qualityId !== undefined || data.difficultyId !== undefined) return true;

    return false;
};


const ratingPostSchema = z.object({
    mapId: mapIdSchema_NonObject,
    qualityId: qualityIdSchema_NonObject.optional(),
    difficultyId: difficultyIdSchema_NonObject.optional(),
}).strict().refine(refineRating);


const ratingPatchSchema = z.object({
    qualityId: qualityIdSchema_NonObject.nullish(),
    difficultyId: difficultyIdSchema_NonObject.nullish(),
}).strict();


const ratingOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.RatingScalarFieldEnum),
    ["mapId", "qualityId", "difficultyId"],
    ["asc", "desc", "desc"],
);




const getRatingById = async<
    ThrowOnMatch extends boolean,
    ReturnType extends ThrowOnMatch extends true ? void : Rating,
>(
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    id: number,
): Promise<ReturnType> => {
    const rating: Rating | null = await prisma.rating.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
    });


    if (throwOnMatch) {
        if (rating) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: `A rating already exists with id "${id}"`,
            });
        }

        return undefined as ReturnType;
    }
    else {
        if (!rating) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No rating exists with id "${id}"`,
            });
        }

        return rating as ReturnType;
    }
};




const getRatingByMapAndUser = async <
    ThrowOnMatch extends boolean,
    ReturnType extends ThrowOnMatch extends true ? void : Rating,
>(
    throwOnMatch: ThrowOnMatch,
    prisma: MyPrismaClient,
    mapId: number,
    submittedBy: number
): Promise<ReturnType> => {
    const rating: Rating | null = await prisma.rating.findUnique({  //having type declaration here AND in function signature is safer
        where: {
            mapId_submittedBy: {
                mapId: mapId,
                submittedBy: submittedBy,
            },
        },
    });


    if (throwOnMatch) {
        if (rating) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: `A rating has already been submitted by user "${submittedBy}" for map "${mapId}"`,
            });
        }

        return undefined as ReturnType;
    }
    else {
        if (!rating) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No rating exists for user "${submittedBy}" and map "${mapId}"`,
            });
        }

        return rating as ReturnType;
    }
};




const getDifficultyValuesMap = async (prisma: MyPrismaClient): Promise<ValuesMap> => {
    const parentDifficulties = await prisma.difficulty.findMany({
        where: { parentDifficultyId: 0 },
        orderBy: { order: "asc" },
        include: { ChildDifficulty: true },
    });

    if (!parentDifficulties.length) throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No parent difficulties exist. Please contact an admin.",
    });


    const difficultyValuesMap: ValuesMap = new Map();

    for (const parentDifficulty of parentDifficulties) {
        //the +1 means the last child will not reach the next whole number value. this is intentional to add greater weight to going up a difficulty tier.
        const valueIncrement = 1 / (parentDifficulty.ChildDifficulty.length + 1);

        let difficultyValue = parentDifficulty.order - 1;


        for (const childDifficulty of parentDifficulty.ChildDifficulty) {
            difficultyValue += valueIncrement;

            difficultyValuesMap.set(childDifficulty.id, difficultyValue);
        }
    }


    return difficultyValuesMap;
};


const getQualityValuesMap = async (prisma: MyPrismaClient): Promise<ValuesMap> => {
    const qualities = await prisma.quality.findMany({
        orderBy: { order: "asc" },
    });

    if (!qualities.length) throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No qualities exist. Please contact an admin.",
    });


    let qualityValue = 0;
    const qualityValuesMap: ValuesMap = new Map();

    for (const quality of qualities) {
        if (quality.order !== qualityValue) console.warn(`Quality "${quality.id}" has order "${quality.order}" but should have order "${qualityValue}".`);


        qualityValuesMap.set(quality.id, qualityValue);
        qualityValue++;
    }


    return qualityValuesMap;
};


const getAverageId = (valuesMap: ValuesMap, averageValue: number): number => {
    let lowerBoundValue = -Infinity;
    let lowerBoundID = -Infinity;
    let upperBoundValue = Infinity;
    let upperBoundID = -Infinity;

    for (const [id, value] of valuesMap.entries()) {

        if (value === averageValue) return id;

        if (value < averageValue) {
            if (value > lowerBoundValue) {
                lowerBoundValue = value;
                lowerBoundID = id;
            }
        }
        else {  //if this block is reached, value must be greater than averageValue
            if (value < upperBoundValue) {
                upperBoundValue = value;
                upperBoundID = id;
            }
        }
    }


    const lowerBoundDifference = averageValue - lowerBoundValue;
    const upperBoundDifference = upperBoundValue - averageValue;


    let averageId;

    if (upperBoundDifference <= lowerBoundDifference) averageId = upperBoundID;
    else averageId = lowerBoundID;


    return averageId;
};


const getRatingsInfo = async (ratings: Rating[], prisma: MyPrismaClient) => {
    const difficultyValuesMap = await getDifficultyValuesMap(prisma);
    const qualityValuesMap = await getQualityValuesMap(prisma);


    let qualityCount = 0;
    let qualitySum = 0;
    let difficultyCount = 0;
    let difficultySum = 0;


    for (const rating of ratings) {
        let hasValuesBool = false;


        if (rating.qualityId) {
            hasValuesBool = true;


            const qualityValue = difficultyValuesMap.get(rating.qualityId);

            if (!qualityValue) throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Undefined qualityValue for quality ${rating.qualityId} from rating ${rating.id}. Please contact an admin.`,
            });


            qualityCount++;
            qualitySum += qualityValue;
        }


        if (rating.difficultyId) {
            hasValuesBool = true;


            const difficultyValue = difficultyValuesMap.get(rating.difficultyId);

            if (!difficultyValue) throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Undefined difficultyValue for difficulty ${rating.difficultyId} from rating ${rating.id}. Please contact an admin.`,
            });


            difficultyCount++;
            difficultySum += difficultyValue;
        }


        if (!hasValuesBool) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Rating ${rating.id} has no values. Please contact an admin.`,
        });
    }


    const overallCount = ratings.length;

    const unroundedAverageQualityValue = qualityCount ? qualitySum / qualityCount : undefined;
    const unroundedAverageDifficultyValue = difficultyCount ? difficultySum / difficultyCount : undefined;

    const averageQualityID = unroundedAverageQualityValue ? getAverageId(qualityValuesMap, unroundedAverageQualityValue) : undefined;
    const averageDifficultyID = unroundedAverageDifficultyValue ? getAverageId(difficultyValuesMap, unroundedAverageDifficultyValue) : undefined;


    let roundedAverageQualityValue = undefined;
    let roundedAverageDifficultyValue = undefined;

    if (unroundedAverageQualityValue) {
        roundedAverageQualityValue = Math.round(unroundedAverageQualityValue * 10) / 10;
    }

    if (unroundedAverageDifficultyValue) {
        roundedAverageDifficultyValue = Math.round(unroundedAverageDifficultyValue * 10) / 10;
    }


    const ratingsInfo: RatingsInfo = {
        averageQualityId: averageQualityID,
        averageQualityValue: roundedAverageQualityValue,
        averageDifficultyId: averageDifficultyID,
        averageDifficultyValue: roundedAverageDifficultyValue,
        overallCount: overallCount,
        qualityCount: qualityCount,
        difficultyCount: difficultyCount,
    };


    return ratingsInfo;
};




export const ratingRouter = createTRPCRouter({
    getAll: adminProcedure
        .input(ratingOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.rating.findMany({
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: adminProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(ratingOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const ratings = await ctx.prisma.rating.findMany({
                skip: numToSkip,
                take: pageSize,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return ratings;
        }),

    getById: adminProcedure
        .input(ratingIdSchema)
        .query(async ({ ctx, input }) => {
            return await getRatingById(false, ctx.prisma, input.id);
        }),

    getByModId: adminProcedure
        .input(
            z.object({
                modId: modIdSchema_NonObject,
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.rating.findMany({ where: { Map: { modId: input.modId } } });
        }),

    getByMapId: adminProcedure
        .input(
            z.object({
                mapId: mapIdSchema_NonObject,
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.rating.findMany({ where: { mapId: input.mapId } });
        }),

    getByUserId: adminProcedure
        .input(
            z.object({
                userId: userIdSchema_NonObject,
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.rating.findMany({ where: { submittedBy: input.userId } });
        }),

    add: loggedInProcedure
        .input(ratingPostSchema)
        .mutation(async ({ ctx, input }) => {
            await getRatingByMapAndUser(true, ctx.prisma, input.mapId, ctx.user.id);     //check that the new rating won't conflict with an existing one


            const currentTime = getCurrentTime();


            const rating = await ctx.prisma.rating.create({
                data: {
                    Map: { connect: { id: input.mapId } },
                    User_SubmittedBy: { connect: { id: ctx.user.id } },
                    timeSubmitted: currentTime,
                    Quality: { connect: { id: input.qualityId } },
                    Difficulty: { connect: { id: input.difficultyId } },
                },
            });


            return rating;
        }),

    edit: loggedInProcedure
        .input(ratingPatchSchema.merge(ratingIdSchema).refine(refineRating))
        .mutation(async ({ ctx, input }) => {
            const ratingFromId = await getRatingById(false, ctx.prisma, input.id);  //check that id matches an existing rating


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, ratingFromId.submittedBy);    //check that user has permission to edit this rating


            if (input.qualityId === null && input.difficultyId === null) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "qualityId and difficultyId cannot both be null. If you want to delete a rating, use the delete mutation instead.",
            });


            const currentTime = getCurrentTime();


            const rating = await ctx.prisma.rating.update({
                where: { id: input.id },
                data: {
                    timeSubmitted: currentTime,
                    Quality:
                        input.qualityId === null ?
                            { disconnect: true } :
                            { connect: { id: input.qualityId } },
                    Difficulty:
                        input.difficultyId === null ?
                            { disconnect: true } :
                            { connect: { id: input.difficultyId } },
                },
            });


            return rating;
        }),

    delete: loggedInProcedure
        .input(ratingIdSchema)
        .mutation(async ({ ctx, input }) => {
            const ratingFromId = await getRatingById(false, ctx.prisma, input.id);  //check that id matches an existing rating


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, ratingFromId.submittedBy);    //check that user has permission to delete this rating


            await ctx.prisma.rating.delete({ where: { id: input.id } });


            return true;
        }),

    getModRatingData: publicProcedure
        .input(
            z.object({
                modId: modIdSchema_NonObject,
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            await getModById("Mod", "mod", false, false, ctx.prisma, input.modId);  //check that modId matches an existing mod


            const ratings = await ctx.prisma.rating.findMany({ where: { Map: { modId: input.modId } } });

            if (!ratings.length) return false;


            const ratingsInfo = getRatingsInfo(ratings, ctx.prisma);


            return ratingsInfo;
        }),

    getMapRatingData: publicProcedure
        .input(
            z.object({
                mapId: mapIdSchema_NonObject,
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            await getMapById("Map", false, false, ctx.prisma, input.mapId);  //check that mapId matches an existing map


            const ratings = await ctx.prisma.rating.findMany({ where: { mapId: input.mapId } });

            if (!ratings.length) return false;


            const ratingsInfo = getRatingsInfo(ratings, ctx.prisma);


            return ratingsInfo;
        }),

    getUserRatingData: loggedInProcedure
        .input(
            z.object({
                userId: userIdSchema_NonObject.optional(),
            }).strict(),
        )
        .query(async ({ ctx, input }) => {
            const userId = input.userId ?? ctx.user.id;

            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, userId);    //check that user has permission to view this user's ratings


            const ratings = await ctx.prisma.rating.findMany({ where: { submittedBy: userId } });

            if (!ratings.length) return false;


            const ratingsInfo = getRatingsInfo(ratings, ctx.prisma);


            return ratingsInfo;
        }),
});
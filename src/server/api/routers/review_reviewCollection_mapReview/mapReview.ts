import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, MapReview } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { getReviewById, reviewIdSchema_NonObject } from "./review";
import { getMapById, mapIdSchema_NonObject } from "../map_mod_publisher/map";
import { getLengthById, lengthIdSchema_NonObject } from "../length";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged } from "../../utils/permissions";
import { getCurrentTime } from "../../utils/getCurrentTime";




type ExpandedMapReview = MapReview & {
    Review: {
        ReviewCollection: {
            userId: number;
        };
    };
};




const defaultMapReviewSelect = Prisma.validator<Prisma.MapReviewSelect>()({
    id: true,
    reviewId: true,
    mapId: true,
    lengthId: true,
    timeSubmitted: true,
    likes: true,
    dislikes: true,
    otherComments: true,
    displayRatingBool: true,
});




const mapReviewIdSchema_NonObject = z.number().int().gte(1).lte(INT_MAX_SIZES.int.unsigned);

const mapReviewIdSchema = z.object({
    id: mapReviewIdSchema_NonObject,
}).strict();


const reviewIdSchemaForMapReview = z.object({
    reviewId: reviewIdSchema_NonObject,
}).strict();

const mapIdSchemaForMapReview = z.object({
    mapId: mapIdSchema_NonObject,
}).strict();

const lengthIdForMapReview = z.object({
    lengthId: lengthIdSchema_NonObject,
}).strict();

const combinedIdsSchemaForMapReview = reviewIdSchemaForMapReview.merge(mapIdSchemaForMapReview).merge(lengthIdForMapReview);


const mapReviewLikesSchema_NonObject = z.string().min(1).max(500);
const mapReviewDislikesSchema_NonObject = z.string().min(1).max(500);
const mapReviewOtherCommentsSchema_NonObject = z.string().min(1).max(500);

const mapReviewPostSchema = z.object({
    likes: mapReviewLikesSchema_NonObject.optional(),
    dislikes: mapReviewDislikesSchema_NonObject.optional(),
    otherComments: mapReviewOtherCommentsSchema_NonObject.optional(),
    displayRatingBool: z.boolean().default(false),
}).strict().merge(combinedIdsSchemaForMapReview);

const mapReviewPatchSchema = z.object({
    likes: mapReviewLikesSchema_NonObject.nullish(),
    dislikes: mapReviewDislikesSchema_NonObject.nullish(),
    otherComments: mapReviewOtherCommentsSchema_NonObject.nullish(),
    displayRatingBool: z.boolean().optional(),
}).strict().merge(mapReviewIdSchema).merge(combinedIdsSchemaForMapReview.partial());


const mapReviewOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.MapReviewScalarFieldEnum),
    ["mapId", "reviewId"],
    ["asc"],
);




const validateMapReview = async (prisma: MyPrismaClient, reviewId: number, mapId: number): Promise<void> => {
    const matchingMapReview = await prisma.mapReview.findUnique({
        where: {
            reviewId_mapId: {
                reviewId: reviewId,
                mapId: mapId,
            },
        },
    });


    if (matchingMapReview) throw new TRPCError({
        code: "FORBIDDEN",
        message: `Conflicts with existing mapReview ${matchingMapReview.id}`,
    });
};




const getMapReviewById = async<
    ReturnUserIdBool extends boolean,
    ReturnType = ReturnUserIdBool extends true ? ExpandedMapReview : MapReview,
>(
    prisma: MyPrismaClient,
    id: number,
    returnUserIdBool: ReturnUserIdBool,
): Promise<ReturnType> => {
    let mapReview: ReturnType | null;

    if (returnUserIdBool) {
        mapReview = await prisma.mapReview.findUnique({
            where: { id: id },
            select: {
                ...defaultMapReviewSelect,
                Review: { select: { ReviewCollection: { select: { id: true } } } },
            },
        }) as ReturnType;
    }
    else {
        mapReview = await prisma.mapReview.findUnique({
            where: { id: id },
            select: defaultMapReviewSelect,
        }) as ReturnType;
    }


    if (!mapReview) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No mapReview exists with id "${id}"`,
        });
    }


    return mapReview;
};




export const mapReviewRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(mapReviewOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.mapReview.findMany({
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(mapReviewOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const mapReviews = await ctx.prisma.mapReview.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return mapReviews;
        }),

    getById: publicProcedure
        .input(mapReviewIdSchema)
        .query(async ({ ctx, input }) => {
            return await getMapReviewById(ctx.prisma, input.id, false);
        }),

    getByReviewId: publicProcedure
        .input(reviewIdSchemaForMapReview.merge(mapReviewOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.mapReview.findMany({
                where: { reviewId: input.reviewId },
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getByMapId: publicProcedure
        .input(mapIdSchemaForMapReview.merge(mapReviewOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.mapReview.findMany({
                where: { mapId: input.mapId },
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getByLengthId: publicProcedure
        .input(lengthIdForMapReview.merge(mapReviewOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.mapReview.findMany({
                where: { lengthId: input.lengthId },
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    add: adminProcedure
        .input(mapReviewPostSchema)
        .mutation(async ({ ctx, input }) => {
            const reviewFromId = await getReviewById(ctx.prisma, input.reviewId, true); //check that reviewId matches an existing review
            await getMapById("Map", false, false, ctx.prisma, input.mapId);     //check that mapId matches an existing map
            await validateMapReview(ctx.prisma, input.reviewId, input.mapId);   //check that the new mapReview won't conflict with an existing one


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, reviewFromId.ReviewCollection.userId); //check that the user has permission to add a mapReview to this review


            const currentTime = getCurrentTime();


            const mapReview = await ctx.prisma.mapReview.create({
                data: {
                    Review: { connect: { id: input.reviewId } },
                    Map: { connect: { id: input.mapId } },
                    Length: { connect: { id: input.lengthId } },
                    timeSubmitted: currentTime,
                    likes: input.likes,
                    dislikes: input.dislikes,
                    otherComments: input.otherComments,
                    displayRatingBool: input.displayRatingBool,
                },
                select: defaultMapReviewSelect,
            });


            return mapReview;
        }),

    edit: adminProcedure
        .input(mapReviewPatchSchema)
        .mutation(async ({ ctx, input }) => {
            const mapReviewFromId = await getMapReviewById(ctx.prisma, input.id, true);  //check that id matches an existing mapReview


            const reviewId = input.reviewId ?? mapReviewFromId.reviewId;

            await getReviewById(ctx.prisma, reviewId, false); //check that reviewId matches an existing review


            const mapId = input.mapId ?? mapReviewFromId.mapId;

            try {
                await getMapById("Map", false, false, ctx.prisma, mapId); //check that mapId matches an existing map
            }
            catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === "NOT_FOUND") {
                    const message = `MapReview ${input.id} references map ${mapId}, which does not exist.`;

                    console.error(message);

                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `${message} Please notify an admin. In the meantime, this can be worked around by submitting a valid replacement mapId.`,
                    });
                }
                else {
                    throw error;
                }
            }


            const lengthId = input.lengthId ?? mapReviewFromId.lengthId;

            try {
                await getLengthById(ctx.prisma, lengthId); //check that lengthId matches an existing length
            }
            catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === "NOT_FOUND") {
                    const message = `MapReview ${input.id} references length ${lengthId}, which does not exist.`;

                    console.error(message);

                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `${message} Please notify an admin. In the meantime, this can be worked around by submitting a valid replacement lengthId.`,
                    });
                }
                else {
                    throw error;
                }
            }


            await validateMapReview(ctx.prisma, reviewId, mapId); //check that the new mapReview won't conflict with an existing one


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, mapReviewFromId.Review.ReviewCollection.userId); //check that the user has permission to edit this mapReview


            const currentTime = getCurrentTime();


            const mapReview = await ctx.prisma.mapReview.update({
                where: { id: input.id },
                data: {
                    Review: { connect: { id: reviewId } },
                    Map: { connect: { id: mapId } },
                    Length: { connect: { id: lengthId } },
                    timeSubmitted: currentTime,
                    likes: input.likes,
                    dislikes: input.dislikes,
                    otherComments: input.otherComments,
                    displayRatingBool: input.displayRatingBool,
                },
                select: defaultMapReviewSelect,
            });


            return mapReview;
        }),

    delete: adminProcedure
        .input(mapReviewIdSchema)
        .mutation(async ({ ctx, input }) => {
            const mapReviewFromId = await getMapReviewById(ctx.prisma, input.id, true);  //check that id matches an existing mapReview


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, mapReviewFromId.Review.ReviewCollection.userId); //check that the user has permission to delete this mapReview


            await ctx.prisma.mapReview.delete({ where: { id: input.id } });


            return true;
        }),
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure, modReviewerProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Review } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { getModById, modIdSchema_NonObject } from "../map_mod_publisher/mod";
import { getReviewCollectionById, reviewCollectionIdSchema_NonObject } from "./reviewCollection";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged } from "../../utils/permissions";
import { getCurrentTime } from "../../utils/getCurrentTime";




type DefaultReview = Review & {
    MapReview: [];
};

type ExpandedReview = DefaultReview & {
    ReviewCollection: {
        userId: string;
    };
};




const defaultReviewSelect = Prisma.validator<Prisma.ReviewSelect>()({
    id: true,
    modId: true,
    reviewCollectionId: true,
    timeSubmitted: true,
    likes: true,
    dislikes: true,
    otherComments: true,
    MapReview: { select: { id: true } },
});




export const reviewIdSchema_NonObject = z.number().int().gte(1).lte(INT_MAX_SIZES.mediumInt.unsigned);

const reviewIdSchema = z.object({
    id: reviewIdSchema_NonObject,
}).strict();


const modIdSchemaForReview = z.object({
    modId: modIdSchema_NonObject,
}).strict();

const reviewCollectionIdSchemaForReview = z.object({
    reviewCollectionId: reviewCollectionIdSchema_NonObject,
}).strict();

const combinedIdsSchemaForReview = modIdSchemaForReview.merge(reviewCollectionIdSchemaForReview);


const reviewLikesSchema_NonObject = z.string().min(1).max(1000);
const reviewDislikesSchema_NonObject = z.string().min(1).max(1000);
const reviewOtherCommentsSchema_NonObject = z.string().min(1).max(1500);

const reviewPostSchema = z.object({
    likes: reviewLikesSchema_NonObject.optional(),
    dislikes: reviewDislikesSchema_NonObject.optional(),
    otherComments: reviewOtherCommentsSchema_NonObject.optional(),
}).strict().merge(combinedIdsSchemaForReview);

const reviewPatchSchema = z.object({
    likes: reviewLikesSchema_NonObject.nullish(),
    dislikes: reviewDislikesSchema_NonObject.nullish(),
    otherComments: reviewOtherCommentsSchema_NonObject.nullish(),
}).strict().merge(reviewIdSchema).merge(combinedIdsSchemaForReview.partial());


const reviewOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.ReviewScalarFieldEnum),
    ["modId", "reviewCollectionId"],
    ["asc"],
);




const validateReview = async (prisma: MyPrismaClient, reviewCollectionId: number, modId: number): Promise<void> => {
    const matchingReview = await prisma.review.findUnique({
        where: {
            reviewCollectionId_modId: {
                reviewCollectionId: reviewCollectionId,
                modId: modId,
            },
        },
    });


    if (matchingReview) throw new TRPCError({
        code: "FORBIDDEN",
        message: `Conflicts with existing review ${matchingReview.id}`,
    });
};




export const getReviewById = async<
    ReturnUserIdBool extends boolean,
    ReturnType = ReturnUserIdBool extends true ? ExpandedReview : DefaultReview,
>(
    prisma: MyPrismaClient,
    id: number,
    returnUserIdBool: ReturnUserIdBool,
): Promise<ReturnType> => {
    let review: ReturnType | null;

    if (returnUserIdBool) {
        review = await prisma.review.findUnique({
            where: { id: id },
            select: {
                ...defaultReviewSelect,
                ReviewCollection: { select: { userId: true } },
            },
        }) as ReturnType;
    }
    else {
        review = await prisma.review.findUnique({
            where: { id: id },
            select: defaultReviewSelect,
        }) as ReturnType;
    }


    if (!review) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No review exists with id "${id}"`,
        });
    }


    return review;
};




export const reviewRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(reviewOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.review.findMany({
                select: defaultReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(reviewOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const reviews = await ctx.prisma.review.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return reviews;
        }),

    getById: publicProcedure
        .input(reviewIdSchema)
        .query(async ({ ctx, input }) => {
            return await getReviewById(ctx.prisma, input.id, false);
        }),

    getByReviewCollectionId: publicProcedure
        .input(reviewCollectionIdSchemaForReview.merge(reviewOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.review.findMany({
                where: { reviewCollectionId: input.reviewCollectionId },
                select: defaultReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getByModId: publicProcedure
        .input(modIdSchemaForReview.merge(reviewOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.review.findMany({
                where: { modId: input.modId },
                select: defaultReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    add: modReviewerProcedure
        .input(reviewPostSchema)
        .mutation(async ({ ctx, input }) => {
            const reviewCollectionFromId = await getReviewCollectionById(ctx.prisma, input.reviewCollectionId);  //check that reviewCollectionId matches an existing reviewCollection
            await getModById("Mod", "mod", false, false, ctx.prisma, input.modId);  //check that modId matches an existing mod
            await validateReview(ctx.prisma, input.reviewCollectionId, input.modId);     //check that the new review won't conflict with an existing one


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, reviewCollectionFromId.userId); //check that the user is privileged to add a review to this reviewCollection


            const currentTime = getCurrentTime();


            const review = await ctx.prisma.review.create({
                data: {
                    Mod: { connect: { id: input.modId } },
                    ReviewCollection: { connect: { id: input.reviewCollectionId } },
                    timeSubmitted: currentTime,
                    likes: input.likes,
                    dislikes: input.dislikes,
                    otherComments: input.otherComments,
                },
                select: defaultReviewSelect,
            });


            return review;
        }),

    edit: modReviewerProcedure
        .input(reviewPatchSchema)
        .mutation(async ({ ctx, input }) => {
            const reviewFromId = await getReviewById(ctx.prisma, input.id, false);  //check that id matches an existing review


            const reviewCollectionId = input.reviewCollectionId ?? reviewFromId.reviewCollectionId;

            const reviewCollectionFromId = await getReviewCollectionById(ctx.prisma, reviewCollectionId);  //check that reviewCollectionId matches an existing reviewCollection


            const modId = input.modId ?? reviewFromId.modId;

            try {
                await getModById("Mod", "mod", false, false, ctx.prisma, modId);  //check that modId matches an existing mod
            }
            catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === "NOT_FOUND") {
                    const message = `Review ${input.id} references mod ${modId}, which does not exist.`;

                    console.error(message);

                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: `${message} Please notify an admin. In the meantime, this can be worked around by submitting a valid replacement modId.`,
                    });
                }
                else {
                    throw error;
                }
            }


            await validateReview(ctx.prisma, reviewCollectionId, modId);     //check that the new review won't conflict with an existing one


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, reviewCollectionFromId.userId); //check that the user is privileged to add a review to this reviewCollection


            const currentTime = getCurrentTime();


            const review = await ctx.prisma.review.update({
                where: { id: input.id },
                data: {
                    Mod: { connect: { id: modId } },
                    ReviewCollection: { connect: { id: reviewCollectionId } },
                    timeSubmitted: currentTime,
                    likes: input.likes,
                    dislikes: input.dislikes,
                    otherComments: input.otherComments,
                },
                select: defaultReviewSelect,
            });


            return review;
        }),

    delete: modReviewerProcedure
        .input(reviewIdSchema)
        .mutation(async ({ ctx, input }) => {
            const reviewFromId = await getReviewById(ctx.prisma, input.id, true);  //check that id matches an existing review


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, reviewFromId.ReviewCollection.userId); //check that the user is privileged to delete reviews


            await ctx.prisma.review.delete({ where: { id: input.id } });


            return true;
        }),
});
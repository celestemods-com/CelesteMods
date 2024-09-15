import { z } from "zod";
import { createTRPCRouter, publicProcedure, modReviewerProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, ReviewCollection } from "@prisma/client";
import { getCombinedSchema, getOrderObjectArray } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { userIdSchema_NonObject } from "../user_userClaim/user";
import { ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, checkIsPrivileged } from "../../utils/permissions";




type ExpandedReviewCollection = ReviewCollection & {
    Review: {
        id: number;
    }[];
};




const defaultReviewCollectionSelect = Prisma.validator<Prisma.ReviewCollectionSelect>()({
    id: true,
    userId: true,
    name: true,
    description: true,
    Review: { select: { id: true } },
});




const reviewCollectionNameSchema_NonObject = z.string().min(1).max(100);


export const reviewCollectionIdSchema_NonObject = z.number().int().gte(1).lte(INT_MAX_SIZES.smallInt.unsigned);

const reviewCollectionIdSchema = z.object({
    id: reviewCollectionIdSchema_NonObject,
}).strict();


const userIdSchemaForReviewCollection = z.object({
    userId: userIdSchema_NonObject,
}).strict();

const reviewCollectionPostSchema = z.object({
    name: reviewCollectionNameSchema_NonObject,
    description: z.string().min(1).max(500),
}).strict().merge(userIdSchemaForReviewCollection.partial());


const reviewCollectionOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.ReviewCollectionScalarFieldEnum),
    ["userId", "name"],
    ["asc"],
);




const validateReviewCollection = async (prisma: MyPrismaClient, newUserId: string, newName?: string): Promise<void> => {
    if (!newName) return;

    
    const matchingReviewCollection = await prisma.reviewCollection.findUnique({
        where: {
            userId_name: {
                userId: newUserId,
                name: newName,
            },
        },
    });


    if (matchingReviewCollection) throw new TRPCError({
        code: "FORBIDDEN",
        message: `Conflicts with existing reviewCollection ${matchingReviewCollection.id}`,
    });
};




export const getReviewCollectionById = async (prisma: MyPrismaClient, id: number): Promise<ExpandedReviewCollection> => {
    const reviewCollection: ExpandedReviewCollection | null = await prisma.reviewCollection.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultReviewCollectionSelect,
    });


    if (!reviewCollection) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No reviewCollection exists with id "${id}"`,
        });
    }


    return reviewCollection;
};




export const reviewCollectionRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(reviewCollectionOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.reviewCollection.findMany({
                select: defaultReviewCollectionSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(reviewCollectionOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const reviewCollections = await ctx.prisma.reviewCollection.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultReviewCollectionSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return reviewCollections;
        }),

    getById: publicProcedure
        .input(reviewCollectionIdSchema)
        .query(async ({ ctx, input }) => {
            return await getReviewCollectionById(ctx.prisma, input.id);
        }),

    getByUserId: publicProcedure
        .input(userIdSchemaForReviewCollection.merge(reviewCollectionOrderSchema))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.reviewCollection.findMany({
                where: { userId: input.userId },
                select: defaultReviewCollectionSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: reviewCollectionNameSchema_NonObject,
            }).strict().merge(reviewCollectionOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const reviewCollections = await ctx.prisma.reviewCollection.findMany({
                where: { name: { contains: input.query } },
                select: defaultReviewCollectionSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return reviewCollections;
        }),

    add: modReviewerProcedure
        .input(reviewCollectionPostSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = input.userId ?? ctx.user.id;


            await validateReviewCollection(ctx.prisma, userId, input.name);     //check that the new reviewCollection won't conflict with an existing one


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, userId);  //check that the user has permission to add the reviewCollection


            const reviewCollection = await ctx.prisma.reviewCollection.create({
                data: {
                    User: { connect: { id: userId } },
                    name: input.name,
                    description: input.description,
                },
                select: defaultReviewCollectionSelect,
            });


            return reviewCollection;
        }),

    edit: modReviewerProcedure
        .input(reviewCollectionPostSchema.partial().merge(reviewCollectionIdSchema))
        .mutation(async ({ ctx, input }) => {
            const userId = input.userId ?? ctx.user.id;


            const reviewCollectionFromId = await getReviewCollectionById(ctx.prisma, input.id);  //check that id matches an existing reviewCollection
            await validateReviewCollection(ctx.prisma, userId, input.name);     //check that the new reviewCollection won't conflict with an existing one


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, reviewCollectionFromId.userId);  //check that the user has permission to edit the reviewCollection (is a moderator, an admin, or the owner)


            const reviewCollection = await ctx.prisma.reviewCollection.update({
                where: { id: input.id },
                data: {
                    User: { connect: { id: userId } },
                    name: input.name,
                    description: input.description,
                },
                select: defaultReviewCollectionSelect,
            });


            return reviewCollection;
        }),

    delete: modReviewerProcedure
        .input(reviewCollectionIdSchema)
        .mutation(async ({ ctx, input }) => {
            const reviewCollectionFromId = await getReviewCollectionById(ctx.prisma, input.id);  //check that id matches an existing reviewCollection


            checkIsPrivileged(MODLIST_MODERATOR_PERMISSION_STRINGS, ctx.user, reviewCollectionFromId.userId);  //check that the user has permission to edit the reviewCollection (is a moderator, an admin, or the owner)


            await ctx.prisma.reviewCollection.delete({ where: { id: input.id } });  //this deletion should cascade to any connected reviews or mapReviews

            
            return true;
        }),
});
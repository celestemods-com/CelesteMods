import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, MapReview } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";




const defaultMapReviewSelect = Prisma.validator<Prisma.MapReviewSelect>()({
    id: true,
    name: true,
    description: true,
    order: true,
});




const mapreviewNameSchema_NonObject = z.string().min(1).max(20);


const mapreviewIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.tinyInt.unsigned);

const mapreviewIdSchema = z.object({
    id: mapreviewIdSchema_NonObject,
}).strict();


const mapreviewPostSchema = z.object({
    name: mapreviewNameSchema_NonObject,
    description: z.string().min(1).max(100),
    order: z.number().gte(1).lte(intMaxSizes.tinyInt.unsigned),
}).strict();


const mapreviewOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.MapReviewScalarFieldEnum),
    ["order"],
    ["asc"],
);




const validateMapReview = async (prisma: MyPrismaClient, newName?: string): Promise<void> => {
    if (!newName) return;

    const matchingMapReview = await prisma.mapreview.findUnique({ where: { name: newName } });

    if (matchingMapReview) throw new TRPCError({
        code: "FORBIDDEN",
        message: `Conflicts with existing mapreview ${matchingMapReview.id}`,
    });
}




const getMapReviewById = async (prisma: MyPrismaClient, id: number): Promise<Pick<MapReview, keyof typeof defaultMapReviewSelect>> => {
    const mapreview: MapReview | null = await prisma.mapreview.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultMapReviewSelect,
    });

    if (!mapreview) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No mapreview exists with id "${id}"`,
        });
    }

    return mapreview;
}




export const mapreviewRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(mapreviewOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.mapreview.findMany({
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(mapreviewOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const mapreviews = await ctx.prisma.mapreview.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return mapreviews;
        }),

    getById: publicProcedure
        .input(mapreviewIdSchema)
        .query(async ({ ctx, input }) => {
            return await getMapReviewById(ctx.prisma, input.id);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: mapreviewNameSchema_NonObject,
            }).strict().merge(mapreviewOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const mapreviews = await ctx.prisma.mapreview.findMany({
                where: { name: { contains: input.query } },
                select: defaultMapReviewSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return mapreviews;
        }),

    add: adminProcedure
        .input(mapreviewPostSchema)
        .mutation(async ({ ctx, input }) => {
            await validateMapReview(ctx.prisma, input.name);     //check that the new mapreview won't conflict with an existing one


            const mapreview = await ctx.prisma.mapreview.create({
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultMapReviewSelect,
            });


            return mapreview;
        }),

    edit: adminProcedure
        .input(mapreviewPostSchema.partial().merge(mapreviewIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getMapReviewById(ctx.prisma, input.id);  //check that id matches an existing mapreview
            await validateMapReview(ctx.prisma, input.name);     //check that the new mapreview won't conflict with an existing one


            const mapreview = await ctx.prisma.mapreview.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultMapReviewSelect,
            });


            return mapreview;
        }),

    delete: adminProcedure
        .input(mapreviewIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getMapReviewById(ctx.prisma, input.id);  //check that id matches an existing mapreview

            await ctx.prisma.mapreview.delete({ where: { id: input.id } });

            return true;
        }),
});
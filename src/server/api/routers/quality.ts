import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Quality } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";




const defaultQualitySelect = Prisma.validator<Prisma.QualitySelect>()({
    id: true,
    name: true,
    description: true,
    order: true,
});




const qualityNameSchema_NonObject = z.string().min(1).max(20);


export const qualityIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.tinyInt.unsigned);

const qualityIdSchema = z.object({
    id: qualityIdSchema_NonObject,
}).strict();


const qualityPostSchema = z.object({
    name: qualityNameSchema_NonObject,
    description: z.string().min(1).max(100),
    order: z.number().gte(1).lte(intMaxSizes.tinyInt.unsigned),
}).strict();


const qualityOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.QualityScalarFieldEnum),
    ["order"],
    ["asc"],
);




const validateQuality = async (prisma: MyPrismaClient, newName?: string): Promise<void> => {
    if (!newName) return;

    const matchingQuality = await prisma.quality.findUnique({ where: { name: newName } });

    if (matchingQuality) throw new TRPCError({
        message: `Conflicts with existing quality ${matchingQuality.id}`,
        code: "FORBIDDEN",
    });
}




const getQualityById = async (prisma: MyPrismaClient, id: number): Promise<Pick<Quality, keyof typeof defaultQualitySelect>> => {
    const quality: Quality | null = await prisma.quality.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultQualitySelect,
    });

    if (!quality) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No quality exists with id "${id}"`,
        });
    }

    return quality;
}




export const qualityRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(qualityOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.quality.findMany({
                select: defaultQualitySelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(qualityOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const qualitys = await ctx.prisma.quality.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultQualitySelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return qualitys;
        }),

    getById: publicProcedure
        .input(qualityIdSchema)
        .query(async ({ ctx, input }) => {
            return await getQualityById(ctx.prisma, input.id);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: qualityNameSchema_NonObject,
            }).strict().merge(qualityOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const qualitys = await ctx.prisma.quality.findMany({
                where: { name: { contains: input.query } },
                select: defaultQualitySelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return qualitys;
        }),

    add: adminProcedure
        .input(qualityPostSchema)
        .mutation(async ({ ctx, input }) => {
            await validateQuality(ctx.prisma, input.name);     //check that the new quality won't conflict with an existing one


            const quality = await ctx.prisma.quality.create({
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultQualitySelect,
            });


            return quality;
        }),

    edit: adminProcedure
        .input(qualityPostSchema.partial().merge(qualityIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getQualityById(ctx.prisma, input.id);     //check that id matches an existing quality
            await validateQuality(ctx.prisma, input.name);  //check that the new quality won't conflict with an existing one


            const quality = await ctx.prisma.quality.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultQualitySelect,
            });


            return quality;
        }),

    delete: adminProcedure
        .input(qualityIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getQualityById(ctx.prisma, input.id);  //check that id matches an existing quality

            await ctx.prisma.quality.delete({ where: { id: input.id } });

            return true;
        }),
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, length } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";




const defaultLengthSelect = Prisma.validator<Prisma.lengthSelect>()({
    id: true,
    name: true,
    description: true,
    order: true,
});




const lengthNameSchema_NonObject = z.string().min(1).max(20);


export const lengthIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.tinyInt.unsigned);

const lengthIdSchema = z.object({
    id: lengthIdSchema_NonObject,
}).strict();


const lengthPostSchema = z.object({
    name: lengthNameSchema_NonObject,
    description: z.string().min(1).max(100),
    order: z.number().gte(1).lte(intMaxSizes.tinyInt.unsigned),
}).strict();


const lengthOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.LengthScalarFieldEnum),
    ["order"],
    ["asc"],
);




const validateLength = async (prisma: MyPrismaClient, newName?: string): Promise<void> => {
    if (!newName) return;

    const matchingLength = await prisma.length.findUnique({ where: { name: newName } });

    if (matchingLength) throw new TRPCError({
        message: `Conflicts with existing length ${matchingLength.id}`,
        code: "FORBIDDEN",
    });
}




const getLengthById = async (prisma: MyPrismaClient, id: number): Promise<Pick<length, keyof typeof defaultLengthSelect>> => {
    const length: length | null = await prisma.length.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultLengthSelect,
    });

    if (!length) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No length exists with id "${id}"`,
        });
    }

    return length;
}




export const lengthRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(lengthOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.length.findMany({
                select: defaultLengthSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(lengthOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const lengths = await ctx.prisma.length.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultLengthSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return lengths;
        }),

    getById: publicProcedure
        .input(lengthIdSchema)
        .query(async ({ ctx, input }) => {
            return await getLengthById(ctx.prisma, input.id);
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: lengthNameSchema_NonObject,
            }).strict().merge(lengthOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const lengths = await ctx.prisma.length.findMany({
                where: { name: { contains: input.query } },
                select: defaultLengthSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return lengths;
        }),

    add: adminProcedure
        .input(lengthPostSchema)
        .mutation(async ({ ctx, input }) => {
            await validateLength(ctx.prisma, input.name);     //check that the new length won't conflict with an existing one


            const length = await ctx.prisma.length.create({
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultLengthSelect,
            });


            return length;
        }),

    edit: adminProcedure
        .input(lengthPostSchema.partial().merge(lengthIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getLengthById(ctx.prisma, input.id);  //check that id matches an existing length
            await validateLength(ctx.prisma, input.name);     //check that the new length won't conflict with an existing one


            const length = await ctx.prisma.length.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                },
                select: defaultLengthSelect,
            });


            return length;
        }),

    delete: adminProcedure
        .input(lengthIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getLengthById(ctx.prisma, input.id);  //check that id matches an existing length

            await ctx.prisma.length.delete({ where: { id: input.id } });

            return true;
        }),
});
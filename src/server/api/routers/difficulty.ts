import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, Difficulty } from "@prisma/client";
import { getCombinedSchema, getOrderObjectArray } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";




const defaultDifficultySelect = Prisma.validator<Prisma.DifficultySelect>()({
    id: true,
    name: true,
    description: true,
    parentDifficultyId: true,
    order: true,
});




const difficultyNameSchema_NonObject = z.string().min(1).max(50);


export const difficultyIdSchema_NonObject = z.number().int().gte(0).lte(INT_MAX_SIZES.smallInt.unsigned);

const difficultyIdSchema = z.object({
    id: difficultyIdSchema_NonObject,
}).strict();


const difficultyPostSchema = z.object({
    name: difficultyNameSchema_NonObject,
    description: z.string().min(1).max(100).nullish(),
    parentDifficultyId: difficultyIdSchema_NonObject.nullable(),
    order: z.number().gte(1).lte(INT_MAX_SIZES.tinyInt.unsigned),
}).strict();


const difficultyOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.DifficultyScalarFieldEnum),
    ["parentDifficultyId", "order"],
    ["asc"],
);

type t = z.infer<typeof difficultyOrderSchema>;
//   ^?




const validateDifficulty = async (
    prisma: MyPrismaClient, id: number | undefined, parentDifficultyId: number | undefined, order: number | undefined
): Promise<void> => {
    if (parentDifficultyId) {
        const parentDifficulty = await prisma.difficulty.findUnique({ where: { id: parentDifficultyId } });

        if (!parentDifficulty) throw new TRPCError({
            code: "NOT_FOUND",
            message: "parentDifficulty not found",
        });

        if (parentDifficulty.parentDifficultyId !== 0) throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "This difficulty is malformed. SubDifficulties may not have their own subDifficulties. Please contact an admin.",
        });
    }


    const matchingDifficulty = await prisma.difficulty.findFirst({
        where: {
            NOT: { id: id },
            parentDifficultyId: parentDifficultyId,
            order: order,
        }
    });

    if (matchingDifficulty) throw new TRPCError({
        code: "FORBIDDEN",
        message: `Conflicts with existing difficulty ${matchingDifficulty.id}`,
    });
}




const getDifficultyById = async (prisma: MyPrismaClient, id: number): Promise<Pick<Difficulty, keyof typeof defaultDifficultySelect>> => {
    const difficulty: Difficulty | null = await prisma.difficulty.findUnique({  //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultDifficultySelect,
    });

    if (!difficulty) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No difficulty exists with id "${id}"`,
        });
    }

    return difficulty;
}




export const difficultyRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(difficultyOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.difficulty.findMany({
                select: defaultDifficultySelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(difficultyOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const difficulties = await ctx.prisma.difficulty.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultDifficultySelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return difficulties;
        }),

    getById: publicProcedure
        .input(difficultyIdSchema)
        .query(async ({ ctx, input }) => {
            return await getDifficultyById(ctx.prisma, input.id);
        }),

    getByParentDifficultyId: publicProcedure
        .input(difficultyIdSchema.merge(difficultyOrderSchema))
        .query(async ({ ctx, input }) => {
            const difficulties = await ctx.prisma.difficulty.findMany({
                where: { parentDifficultyId: input.id },
                select: defaultDifficultySelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return difficulties;
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: difficultyNameSchema_NonObject,
            }).strict().merge(difficultyOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const difficulties = await ctx.prisma.difficulty.findMany({
                where: { name: { contains: input.query } },
                select: defaultDifficultySelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return difficulties;
        }),

    add: adminProcedure
        .input(difficultyPostSchema)
        .mutation(async ({ ctx, input }) => {
            const nonNullParentDifficultyId = input.parentDifficultyId === null ? 0 : input.parentDifficultyId;


            await validateDifficulty(ctx.prisma, undefined, nonNullParentDifficultyId, input.order);     //check that the new difficulty won't conflict with an existing one

            if (nonNullParentDifficultyId === undefined) throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "nonNullParentDifficultyId is undefined, but it was already confirmed as defined. Please contact an admin.",
            });


            const difficulty = await ctx.prisma.difficulty.create({
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                    ParentDifficulty: { connect: { id: nonNullParentDifficultyId } },
                },
                select: defaultDifficultySelect,
            });


            return difficulty;
        }),

    edit: adminProcedure
        .input(difficultyPostSchema.partial().merge(difficultyIdSchema))
        .mutation(async ({ ctx, input }) => {
            const nonNullParentDifficultyId = input.parentDifficultyId === null ? 0 : input.parentDifficultyId;


            await getDifficultyById(ctx.prisma, input.id);  //check that id matches an existing difficulty
            await validateDifficulty(ctx.prisma, input.id, nonNullParentDifficultyId, input.order);     //check that the new difficulty won't conflict with an existing one

            if (nonNullParentDifficultyId === undefined) throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "nonNullParentDifficultyId is undefined, but it was already confirmed as defined. Please contact an admin.",
            });


            const difficulty = await ctx.prisma.difficulty.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    order: input.order,
                    ParentDifficulty: { connect: { id: nonNullParentDifficultyId } },
                },
                select: defaultDifficultySelect,
            });


            return difficulty;
        }),

    delete: adminProcedure
        .input(difficultyIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getDifficultyById(ctx.prisma, input.id);  //check that id matches an existing difficulty

            await ctx.prisma.difficulty.delete({ where: { id: input.id } });

            return true;
        }),
});
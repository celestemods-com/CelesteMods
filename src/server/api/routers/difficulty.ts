import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { intMaxSizes } from "~/consts/integerSizes";


const defaultDifficultySelect = Prisma.validator<Prisma.difficultySelect>()({
    id: true,
    name: true,
    description: true,
    parentDifficultyId: true,
    order: true,
});

const defaultDifficultyOrder: Prisma.difficultyOrderByWithRelationInput = {
    parentDifficultyId: "asc",
    order: "asc",
}


export const difficultyRouter = createTRPCRouter({
    getAll: publicProcedure.query(({ ctx }) => {
        return ctx.prisma.difficulty.findMany({
            select: defaultDifficultySelect,
            orderBy: defaultDifficultyOrder,
        });
    }),

    getMany: publicProcedure    //TODO: add input and query to handle offset-based pagination (see prisma docs)
        .input(
            z.object({})
        )
        .query(({ ctx }) => {

        }),

    getById: publicProcedure
        .input(
            z.object({
                id: z.number().min(1).max(intMaxSizes.smallInt.unsigned),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { id } = input;

            const difficulty = await ctx.prisma.difficulty.findUnique({
                where: { id: id },
                select: defaultDifficultySelect,
            });

            if (!difficulty) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No difficulty with id "${id}"`,
                });
            }

            return difficulty;
        }),
});
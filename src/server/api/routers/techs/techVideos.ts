import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, tech_video } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";
import { techIdSchema_NonObject } from "./tech";




export const defaultTechVideoSelect = Prisma.validator<Prisma.tech_videoSelect>()({
    id: true,
    techId: true,
    url: true,
})




const techVideoIdSchema = z.object({
    id: z.number().int().gte(1).lte(intMaxSizes.smallInt.unsigned),
}).strict();


export const techVideoPostWithTechSchema = z.object({
    url: z.string().url()
}).strict();


const techVideoPostAloneSchema = z.object({
    techId: techIdSchema_NonObject,
}).strict().merge(techVideoPostWithTechSchema);


const techVideoOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.Tech_videoScalarFieldEnum),
    ["techId", "id"],
    ["asc"],
);




//TODO: should accept getOrderObject
const getTechVideoById = async (prisma: MyPrismaClient, id: number): Promise<Pick<tech_video, keyof typeof defaultTechVideoSelect>> => {
    const techVideo: tech_video | null = await prisma.difficulty.findUnique({   //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultTechVideoSelect,
    });

    if (!techVideo) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No techVideo exists with id "${id}"`,
        });
    }

    return techVideo;
}




export const techVideoRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(techVideoOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.tech_video.findMany({
                select: defaultTechVideoSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getById: publicProcedure        //TODO: should accept getOrderObject
        .input(techVideoIdSchema)
        .query(async ({ ctx, input }) => {
            return await getTechVideoById(ctx.prisma, input.id);
        }),

    getByDifficultyId: publicProcedure
        .input(techVideoIdSchema.merge(techVideoOrderSchema))
        .query(async ({ ctx, input }) => {
            const techVideos = await ctx.prisma.tech.findMany({
                where: { difficultyId: input.id },
                select: defaultTechVideoSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return techVideos;
        }),

    add: adminProcedure
        .input(techVideoPostAloneSchema)
        .mutation(async ({ ctx, input }) => {
            const techVideo = await ctx.prisma.tech.create({
                data: {
                    name: input.name,
                    description: input.description,
                    difficulty: { connect: { id: input.difficultyId } },
                    tech_video: { createMany: { data: input.techVideo } },
                },
                select: defaultTechVideoSelect,
            });

            return techVideo;
        }),

    edit: adminProcedure
        .input(techPostSchema.partial().merge(techVideoIdSchema).omit({ techVideo: true }))
        .mutation(async ({ ctx, input }) => {
            await getTechVideoById(ctx.prisma, input.id);  //check that id matches an existing difficulty

            const techVideo = await ctx.prisma.tech.create({
                data: {
                    name: input.name,
                    description: input.description,
                    difficulty: { connect: { id: input.difficultyId } },
                },
                select: defaultTechVideoSelect,
            });

            return techVideo;
        }),

    delete: adminProcedure
        .input(techVideoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getTechVideoById(ctx.prisma, input.id);  //check that id matches an existing difficulty

            await ctx.prisma.tech.delete({ where: { id: input.id } });

            return true;
        }),
});
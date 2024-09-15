import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, TechVideo } from "@prisma/client";
import { getCombinedSchema, getOrderObjectArray } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { techIdSchema_NonObject } from "./tech";




export const defaultTechVideoSelect = Prisma.validator<Prisma.TechVideoSelect>()({
    id: true,
    techId: true,
    url: true,
});




const techVideoIdSchema = z.object({
    id: z.number().int().gte(1).lte(INT_MAX_SIZES.smallInt.unsigned),
}).strict();


export const techVideoPostWithTechSchema = z.object({
    url: z.string().url(),
}).strict();


const techIdSchema_forTechVideos = z.object({
    techId: techIdSchema_NonObject,
}).strict();


const techVideoPostAloneSchema = techIdSchema_forTechVideos.merge(techVideoPostWithTechSchema);


const techVideoOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.TechVideoScalarFieldEnum),
    ["techId", "id"],
    ["asc"],
);




const getTechVideoById = async (prisma: MyPrismaClient, id: number): Promise<Pick<TechVideo, keyof typeof defaultTechVideoSelect>> => {
    const techVideo: TechVideo | null = await prisma.techVideo.findUnique({   //having type declaration here AND in function signature is safer
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
            return ctx.prisma.techVideo.findMany({
                select: defaultTechVideoSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });
        }),

    getById: publicProcedure
        .input(techVideoIdSchema)
        .query(async ({ ctx, input }) => {
            return await getTechVideoById(ctx.prisma, input.id);
        }),

    getByTechId: publicProcedure
        .input(techIdSchema_forTechVideos.merge(techVideoOrderSchema))
        .query(async ({ ctx, input }) => {
            const techVideos = await ctx.prisma.techVideo.findMany({
                where: { techId: input.techId },
                select: defaultTechVideoSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return techVideos;
        }),

    add: adminProcedure
        .input(techVideoPostAloneSchema)
        .mutation(async ({ ctx, input }) => {
            const techVideo = await ctx.prisma.techVideo.create({
                data: {
                    url: input.url,
                    Tech: { connect: { id: input.techId } },
                },
                select: defaultTechVideoSelect,
            });

            return techVideo;
        }),

    edit: adminProcedure
        .input(techVideoPostAloneSchema.partial().merge(techVideoIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getTechVideoById(ctx.prisma, input.id);  //check that id matches an existing techVideo

            if (!input.techId && !input.url) throw new TRPCError({
                code: "BAD_REQUEST",
                message: "No changes were provided.",
            });

            const techVideo = await ctx.prisma.techVideo.update({
                where: { id: input.id },
                data: {
                    url: input.url,
                    Tech: { connect: { id: input.techId } },
                },
                select: defaultTechVideoSelect,
            });

            return techVideo;
        }),

    delete: adminProcedure
        .input(techVideoIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getTechVideoById(ctx.prisma, input.id);  //check that id matches an existing techVideo

            await ctx.prisma.techVideo.delete({ where: { id: input.id } });

            return true;
        }),
});
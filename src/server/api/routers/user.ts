import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, user } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { intMaxSizes } from "~/consts/integerSizes";



const defaultUserSelectObject = {
    id: true,
    displayName: true,
    displayDiscord: true,
    showCompletedMaps: true,
    timeCreated: true,
    accountStatus: true,
};

const defaultUserSelect = Prisma.validator<Prisma.userSelect>()(defaultUserSelectObject);


const discordUserSelectObject = {
    discordId: true,
    discordUsername: true,
    discordDiscrim: true,
}

const discordUserSelect = Prisma.validator<Prisma.userSelect>()(discordUserSelectObject);


const defaultFullUserSelect = Prisma.validator<Prisma.userSelect>()({
    ...defaultUserSelectObject,
    ...discordUserSelectObject,
    permissions: true,
    timeDeletedOrBanned: true,
})




const displayNameSchema_NonObject = z.string().min(1).max(50);


export const userIdSchema_NonObject = z.number().int().gte(1).lte(intMaxSizes.smallInt.unsigned);

const userIdSchema = z.object({
    id: userIdSchema_NonObject,
}).strict();


const userPostSchema = z.object({
    displayName: displayNameSchema_NonObject,
    description: z.string().min(1).max(150).nullish(),
    difficultyId: userIdSchema_NonObject,
}).strict();


const userOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.UserScalarFieldEnum),
    ["difficultyId", "name"],
    ["asc"],
);




const validateUser = async (prisma: MyPrismaClient, newName?: string): Promise<void> => {
    if (!newName) return;

    const matchingUser = await prisma.user.findUnique({ where: { name: newName } });

    if (matchingUser) throw new TRPCError({
        message: `Conflicts with existing user ${matchingUser.id}`,
        code: "FORBIDDEN",
    });
}




const getUserById = async (prisma: MyPrismaClient, id: number) => {
    const user: user | null = await prisma.user.findUnique({    //having type declaration here AND in function signature is safer
        where: { id: id },
        select: defaultUserSelect,
    });

    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No user exists with id "${id}"`,
        });
    }

    return user;
}




export const userRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(userOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.user.findMany({
                select: defaultUserSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });
        }),

    getMany: publicProcedure
        .input(
            z.object({
                pageSize: z.number().int().min(1).max(100).default(50),
                pageNumber: z.number().int().min(1).default(1),
            }).strict().merge(userOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const { pageSize, pageNumber } = input;

            const numToSkip = pageSize * (pageNumber - 1);

            const users = await ctx.prisma.user.findMany({
                skip: numToSkip,
                take: pageSize,
                select: defaultUserSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return users;
        }),

    getById: publicProcedure
        .input(userIdSchema)
        .query(async ({ ctx, input }) => {
            return await getUserById(ctx.prisma, input.id);
        }),

    getByDifficultyId: publicProcedure
        .input(userIdSchema.merge(userOrderSchema))
        .query(async ({ ctx, input }) => {
            const users = await ctx.prisma.user.findMany({
                where: { difficultyId: input.id },
                select: defaultUserSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return users;
        }),

    getByName: publicProcedure
        .input(
            z.object({
                query: displayNameSchema_NonObject,
            }).strict().merge(userOrderSchema),
        )
        .query(async ({ ctx, input }) => {
            const users = await ctx.prisma.user.findMany({
                where: { name: { contains: input.query } },
                select: defaultUserSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return users;
        }),

    add: adminProcedure
        .input(userPostSchema)
        .mutation(async ({ ctx, input }) => {
            await validateUser(ctx.prisma, input.name);     //check that the new user won't conflict with an existing one

            const user = await ctx.prisma.user.create({
                data: {
                    name: input.name,
                    description: input.description,
                    difficulty: { connect: { id: input.difficultyId } },
                },
                select: defaultUserSelect,
            });

            return user;
        }),

    edit: adminProcedure
        .input(userPostSchema.partial().merge(userIdSchema))
        .mutation(async ({ ctx, input }) => {
            await getUserById(ctx.prisma, input.id);  //check that id matches an existing user
            await validateUser(ctx.prisma, input.name);     //check that the new user won't conflict with an existing one

            if (!input.name) throw new TRPCError({
                message: "name is undefined, but it was already confirmed to be defined. Please contact an admin.",
                code: "INTERNAL_SERVER_ERROR",
            });

            const user = await ctx.prisma.user.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    difficulty: { connect: { id: input.difficultyId } },
                },
                select: defaultUserSelect,
            });

            return user;
        }),

    delete: adminProcedure
        .input(userIdSchema)
        .mutation(async ({ ctx, input }) => {
            await getUserById(ctx.prisma, input.id);  //check that id matches an existing user

            await ctx.prisma.user.delete({ where: { id: input.id } });

            return true;
        }),
});
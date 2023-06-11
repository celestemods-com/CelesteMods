import { z } from "zod";
import { createTRPCRouter, publicProcedure, loggedInProcedure, adminProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, User } from "@prisma/client";
import { getCombinedSchema, getOrderObject } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { ADMIN_PERMISSION_STRINGS, Permission, checkIsPrivileged, checkPermissions } from "../utils/permissions";
import { selectIdObject } from "../utils/selectIdObject";




type TrimmedUser = Pick<User, keyof Omit<typeof defaultPartialUserSelect, "Publisher" | "ReviewCollection">> & {
    Publisher: { id: number; }[];
    ReviewCollection: { id: number; }[];
};


type ExpandedUser = TrimmedUser & {
    Account: {
        providerAccountId: string;
    }[];
    discordUsername: string;
    discordDiscriminator: string;
    permissions: string[];
    timeDeletedOrBanned?: number;
};




const defaultPartialUserSelectObject = {
    id: true,
    name: true,
    image: true,
    displayDiscord: true,
    showCompletedMaps: true,
    accountStatus: true,
    Publisher: selectIdObject,
    ReviewCollection: selectIdObject,
};

const defaultPartialUserSelect = Prisma.validator<Prisma.UserSelect>()(defaultPartialUserSelectObject);


const discordUserSelectObject = {
    Account: {
        where: {
            provider: "discord",    //TODO: ensure this is the right casing
        },
        select: {
            providerAccountId: true,
        },
    },
    discordUsername: true,
    discordDiscriminator: true,
};

const discordUserSelect = Prisma.validator<Prisma.UserSelect>()(discordUserSelectObject);


const defaultFullUserSelect = Prisma.validator<Prisma.UserSelect>()({
    ...defaultPartialUserSelectObject,
    ...discordUserSelectObject,
    permissions: true,
    timeDeletedOrBanned: true,
});


/**
 * @param permissions permission string array from sessionUser
 * @param overwrite set to true to force return of defaultFullUserSelect. set to false to force return of defaultPartialUserSelect. leave undefined to use fallback logic.
 */
const getUserSelect = (permissions: Permission[] | undefined, overwrite?: boolean): typeof defaultPartialUserSelect | typeof defaultFullUserSelect => { //TODO: base check on admin OR relevant user
    if (overwrite === true) return defaultFullUserSelect;
    else if (overwrite === false) return defaultPartialUserSelect;

    if (checkPermissions(ADMIN_PERMISSION_STRINGS, permissions)) return defaultFullUserSelect;
    else return defaultPartialUserSelect;
};




export const displayNameSchema_NonObject = z.string().min(1).max(50);


export const userIdSchema_NonObject = z.string().cuid();

const userIdSchema = z.object({
    id: userIdSchema_NonObject,
}).strict();


const userPostSchema = z.object({
    discordCode: z.string(),
    displayName: displayNameSchema_NonObject,
    displayDiscord: z.boolean(),
    showCompletedMaps: z.boolean(),
}).strict();


const userOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.UserScalarFieldEnum),
    ["name"],
    ["asc"],
);




/**
 * @param permissions permission string array from sessionUser
 * @param overwrite set to true to force return of defaultFullUserSelect. set to false to force return of defaultPartialUserSelect. leave undefined to use fallback logic.
 */
export const getUserById = async (
    prisma: MyPrismaClient,
    id: string,
    permissions: Permission[] | undefined,
    overwrite?: boolean,
): Promise<
    TrimmedUser |
    ExpandedUser
> => {
    const user = await prisma.user.findUnique({    //having type declaration here AND in function signature is safer
        where: { id: id },
        select: getUserSelect(permissions, overwrite),
    });

    if (!user) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No user exists with id "${id}"`,
        });
    }

    return user;
};




const undefinedSessionError = new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Session is undefined when it should not be. Please contact an admin.",
});




export const userRouter = createTRPCRouter({
    getAll: publicProcedure
        .input(userOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.user.findMany({
                select: getUserSelect(ctx.session?.user.permissions),
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
                select: getUserSelect(ctx.session?.user.permissions),
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return users;
        }),

    getById: publicProcedure
        .input(userIdSchema)
        .query(async ({ ctx, input }) => {
            return await getUserById(ctx.prisma, input.id, ctx.session?.user.permissions);
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
                select: defaultPartialUserSelect,
                orderBy: getOrderObject(input.selectors, input.directions),
            });

            return users;
        }),

    add: loggedInProcedure
        .input(userPostSchema)
        .mutation(async ({ ctx, input }) => {
            //TODO: implement procedure
            //enforce unique displayNames

            throw "not implemented";
        }),

    edit: loggedInProcedure
        .input(userPostSchema.partial().merge(userIdSchema))
        .mutation(async ({ ctx, input }) => {
            //TODO: implement procedure
            //enforce unique displayNames

            throw "not implemented";
        }),

    delete: loggedInProcedure
        .input(userIdSchema)
        .mutation(async ({ ctx, input }) => {
            if (!ctx.session?.user) throw undefinedSessionError;


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, input.id);  //check user has sufficient privileges

            await getUserById(ctx.prisma, input.id, ctx.user.permissions, true);  //check that id matches an existing user  //overwrite = true because checkIsPrivileged was called


            await ctx.prisma.user.delete({ where: { id: input.id } });


            return true;
        }),

    adminEdits: adminProcedure
        .input(userPostSchema)
        .mutation(async ({ ctx, input }) => {
            //TODO: implement procedure
            //cover things like banning users or changing permissions
            //may split into multiple procedures

            throw "not implemented";
        }),
});
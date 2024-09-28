import { z } from "zod";
import { createTRPCRouter, adminProcedure, loggedInProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { MyPrismaClient } from "~/server/prisma";
import { Prisma, UserClaim as PrismaUserClaim } from "@prisma/client";
import { getCombinedSchema, getOrderObjectArray } from "~/server/api/utils/sortOrderHelpers";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { INT_MAX_SIZES } from "~/consts/integerSizes";
import { userIdSchema_NonObject } from "../../schemas/userIdSchema_NonObject";
import { ADMIN_PERMISSION_STRINGS, checkIsPrivileged, checkPermissions } from "../../utils/permissions";




type ExpandedUserClaim = PrismaUserClaim & {
    User_claimedUser: {
        id: string;
        discordUsername: string | null;
        discordDiscriminator: string | null;
    };
};


type TrimmedUserClaim = Omit<ExpandedUserClaim, "approvedBy"> & {
    approvedBy: undefined;
};




export const defaultUserClaimSelect = Prisma.validator<Prisma.UserClaimSelect>()({
    id: true,
    claimedBy: true,
    claimedUserId: true,
    approvedBy: true,
    User_claimedUser: {
        select: {
            id: true,
            discordUsername: true,
            discordDiscriminator: true,
        },
    },
});




const userClaimIdSchema = z.object({
    id: z.number().int().gte(1).lte(INT_MAX_SIZES.mediumInt.unsigned),
}).strict();


const userIdSchema = z.object({
    userId: userIdSchema_NonObject,
}).strict();


const userIdSchema_forUserClaimCreation = z.object({
    claimedUserId: userIdSchema_NonObject,
}).strict();


const userClaimOrderSchema = getCombinedSchema(
    getNonEmptyArray(Prisma.UserClaimScalarFieldEnum),
    ["id", "claimedBy", "claimedUserId"],
    ["asc"],
);




const getUserClaimById = async(
    prisma: MyPrismaClient,
    id: number
): Promise<ExpandedUserClaim> => {
    const userClaim = await prisma.userClaim.findUnique({
        where: { id: id },
        select: defaultUserClaimSelect,
    });


    if (!userClaim) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: `No userClaim exists with id "${id}"`,
        });
    }


    return userClaim;
};




const getTrimmedUserClaim = (userClaim: ExpandedUserClaim): TrimmedUserClaim => ({
    ...userClaim,
    approvedBy: undefined,
});




export const userClaimRouter = createTRPCRouter({
    getAll: adminProcedure
        .input(userClaimOrderSchema)
        .query(({ ctx, input }) => {
            return ctx.prisma.userClaim.findMany({
                select: defaultUserClaimSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });
        }),

    getById: loggedInProcedure
        .input(userClaimIdSchema)
        .query(async ({ ctx, input }) => {
            const userClaim = await getUserClaimById(ctx.prisma, input.id);


            const isAdmin = checkPermissions(ADMIN_PERMISSION_STRINGS, ctx.user.permissions);

            if (isAdmin) {
                return userClaim;
            }


            const isLinkedUser = ctx.user.id === userClaim.claimedBy || ctx.user.id === userClaim.claimedUserId;

            if (isLinkedUser) {
                return getTrimmedUserClaim(userClaim);
            }
        }),

    getByClaimingUserId: loggedInProcedure
        .input(userIdSchema.merge(userClaimOrderSchema))
        .query(async ({ ctx, input }) => {
            const userClaims = await ctx.prisma.userClaim.findMany({
                where: { claimedBy: input.userId },
                select: defaultUserClaimSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });


            const isAdmin = checkPermissions(ADMIN_PERMISSION_STRINGS, ctx.user.permissions);

            if (isAdmin) {
                return userClaims;
            }


            const isLinkedUser = ctx.user.id === input.userId;

            if (isLinkedUser) {
                return userClaims.map(getTrimmedUserClaim);
            }
        }),

    getByClaimedUserId: adminProcedure
        .input(userIdSchema.merge(userClaimOrderSchema))
        .query(async ({ ctx, input }) => {
            const userClaims = await ctx.prisma.userClaim.findMany({
                where: { claimedUserId: input.userId },
                select: defaultUserClaimSelect,
                orderBy: getOrderObjectArray(input.selectors, input.directions),
            });

            return userClaims;
        }),

    add: loggedInProcedure
        .input(userIdSchema_forUserClaimCreation)
        .mutation(async ({ ctx, input }) => {
            const isDuplicateClaim = await ctx.prisma.userClaim.findFirst({
                where: {
                    claimedBy: ctx.user.id,
                    claimedUserId: input.claimedUserId,
                },
            });

            if (isDuplicateClaim) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `User claim already exists for user ${input.claimedUserId}`,
                });
            }


            const userClaim = await ctx.prisma.userClaim.create({
                data: {
                    // use the connection syntax so Prisma checks that foreign keys exist
                    User_claimedBy: { connect: { id: ctx.user.id } },
                    User_claimedUser: { connect: { id: input.claimedUserId } },
                },
                select: defaultUserClaimSelect,
            });


            return userClaim;
        }),

    delete: loggedInProcedure
        .input(userClaimIdSchema)
        .mutation(async ({ ctx, input }) => {
            const userClaimFromId = await getUserClaimById(ctx.prisma, input.id);  //check that id matches an existing userClaim


            checkIsPrivileged(ADMIN_PERMISSION_STRINGS, ctx.user, userClaimFromId.claimedBy);   //check that the user has permission to delete this userClaim


            await ctx.prisma.userClaim.delete({ where: { id: input.id } });


            return true;
        }),

    verify: adminProcedure
        .input(userClaimIdSchema)
        .mutation(async ({ ctx, input }) => {
            const claim = await ctx.prisma.userClaim.findUnique({
                where: {
                    id: input.id,
                }
            });

            if (!claim) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No user claim exists with id "${input.id}"`,
                });
            }


            const updateUserId: Prisma.PublisherUpdateManyArgs = {
                where: {
                    userId: {
                        equals: claim.claimedUserId,
                    },
                },
                data: {
                    userId: claim.claimedBy,    // using the unchecked syntax instead of the connection syntax because updateMany doesn't support the connection syntax. this is safe, as the claiming userId is checked to be valid before this is used.
                },
            };

            const updateSubmittedBy: Prisma.ModUpdateManyArgs = {
                where: {
                    submittedBy: {
                        equals: claim.claimedUserId,
                    },
                },
                data: {
                    submittedBy: claim.claimedBy,   // using the unchecked syntax instead of the connection syntax because updateMany doesn't support the connection syntax. this is safe, as the claiming userId is checked to be valid before this is used.
                },
            };

            const updateApprovedBy: Prisma.ModUpdateManyArgs = {
                where: {
                    approvedBy: {
                        equals: claim.claimedUserId,
                    },
                },
                data: {
                    approvedBy: claim.claimedBy,    // using the unchecked syntax instead of the connection syntax because updateMany doesn't support the connection syntax. this is safe, as the claiming userId is checked to be valid before this is used.
                },
            };

            const updateMapperUserId: Prisma.MapUpdateManyArgs = {
                where: {
                    mapperUserId: {
                        equals: claim.claimedUserId,
                    },
                },
                data: {
                    mapperUserId: claim.claimedBy,  // using the unchecked syntax instead of the connection syntax because updateMany doesn't support the connection syntax. this is safe, as the claiming userId is checked to be valid before this is used.
                },
            };


            //TODO!!!: make sure nothing was missed here
            // A deeply nested request *may* work here, but I'm not sure. It would be more work and harder to read, but would probably be marginally faster. IMO, it's not worth bothering.
            await ctx.prisma.$transaction(
                async (transactionPrisma) => {  // using an interactive transaction to allow verifying that the claiming user still exists before making changes
                    const claimedByUser = await transactionPrisma.user.findUnique({
                        where: {
                            id: claim.claimedBy,
                        }
                    });

                    if (!claimedByUser) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: `Invalid userClaim. No user exists with id ${claim.claimedBy}, which is the claimedBy user of this userClaim. Please contact an admin.`,
                        });
                    }


                    const claimedUser = await transactionPrisma.user.findUnique({
                        where: {
                            id: claim.claimedUserId,
                        }
                    });

                    if (!claimedUser) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: `Invalid userClaim. No user exists with id ${claim.claimedUserId}, which is the claimed user of this userClaim. Please contact an admin.`,
                        });
                    }


                    const promises = [
                        transactionPrisma.publisher.updateMany(updateUserId),

                        transactionPrisma.mod.updateMany(updateSubmittedBy),
                        transactionPrisma.mod.updateMany(updateApprovedBy),

                        transactionPrisma.map.updateMany(updateMapperUserId),
                        transactionPrisma.map.updateMany(updateSubmittedBy as Prisma.MapUpdateManyArgs),
                        transactionPrisma.map.updateMany(updateApprovedBy as Prisma.MapUpdateManyArgs),

                        transactionPrisma.mod_Archive.updateMany(updateSubmittedBy as Prisma.Mod_ArchiveUpdateManyArgs),
                        transactionPrisma.mod_Archive.updateMany(updateApprovedBy as Prisma.Mod_ArchiveUpdateManyArgs),

                        transactionPrisma.map_Archive.updateMany(updateMapperUserId as Prisma.Map_ArchiveUpdateManyArgs),
                        transactionPrisma.map_Archive.updateMany(updateSubmittedBy as Prisma.Map_ArchiveUpdateManyArgs),
                        transactionPrisma.map_Archive.updateMany(updateApprovedBy as Prisma.Map_ArchiveUpdateManyArgs),

                        transactionPrisma.mod_Edit.updateMany(updateSubmittedBy as Prisma.Mod_EditUpdateManyArgs),
                        transactionPrisma.map_Edit.updateMany(updateMapperUserId as Prisma.Map_EditUpdateManyArgs),
                        transactionPrisma.map_Edit.updateMany(updateSubmittedBy as Prisma.Map_EditUpdateManyArgs),

                        transactionPrisma.mod_New.updateMany(updateSubmittedBy as Prisma.Mod_NewUpdateManyArgs),

                        transactionPrisma.map_NewWithMod_New.updateMany(updateMapperUserId as Prisma.Map_NewWithMod_NewUpdateManyArgs),
                        transactionPrisma.map_NewWithMod_New.updateMany(updateSubmittedBy as Prisma.Map_NewWithMod_NewUpdateManyArgs),

                        transactionPrisma.map_NewSolo.updateMany(updateMapperUserId as Prisma.Map_NewSoloUpdateManyArgs),
                        transactionPrisma.map_NewSolo.updateMany(updateSubmittedBy as Prisma.Map_NewSoloUpdateManyArgs),

                        transactionPrisma.rating.updateMany(updateSubmittedBy as Prisma.RatingUpdateManyArgs),

                        transactionPrisma.reviewCollection.updateMany(updateUserId as Prisma.ReviewCollectionUpdateManyArgs),

                        transactionPrisma.usersToCompletedMaps.updateMany(updateUserId as Prisma.UsersToCompletedMapsUpdateManyArgs),
                    ];

                    await Promise.all(promises);


                    // delete the user after all the other updates have been made, so that a race condition where the delete partially cascades to updating values doesn't occur
                    // this delete should cascade to the userClaim as well (TODO!!!: confirm this and update this comment accordingly or add a deletion of the userClaim)
                    await ctx.prisma.user.delete({
                        where: {
                            id: claim.claimedUserId,
                        }
                    });
                }
            );


            return true;
        }),
});
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "~/server/auth/auth";
import { prisma } from "~/server/prisma";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from 'trpc-openapi';
import { ZodError } from "zod";

const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;




//custom code begins here
import { Permission, ADMIN_PERMISSION_STRINGS, MODLIST_MODERATOR_PERMISSION_STRINGS, MOD_REVIEWER_PERMISSION_STRINGS, checkPermissions } from "~/server/api/utils/permissions";


/** 
 * Reusable middleware that enforces permission levels before running the procedure. 
 * 
 * Omit `permissions` to simply enforce users are logged in
*/
const enforcePermissions = (validPermissionsArray?: readonly Permission[]) => {
  return t.middleware(
    async ({ ctx: oldCtx, next }) => {
      if (!oldCtx.session || !oldCtx.session.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      if (validPermissionsArray) {
        const userPermissionsArray = oldCtx.session.user.permissions;

        const isValid = checkPermissions(validPermissionsArray, userPermissionsArray);

        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }


      return next({
        // infers the `session` as non-nullable
        ctx: { ...oldCtx.session, user: oldCtx.session.user },
      });
    });
};

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const loggedInProcedure = t.procedure.use(enforcePermissions());

export const superAdminProcedure = t.procedure.use(enforcePermissions(["Super_Admin"] as const));

export const adminProcedure = t.procedure.use(enforcePermissions(ADMIN_PERMISSION_STRINGS));

export const modlistModeratorProcedure = t.procedure.use(enforcePermissions(MODLIST_MODERATOR_PERMISSION_STRINGS));

export const modReviewerProcedure = t.procedure.use(enforcePermissions(MOD_REVIEWER_PERMISSION_STRINGS));
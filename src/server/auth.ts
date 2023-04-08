import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { User as PrismaUser } from "@prisma/client";
import { prisma } from "~/server/prisma";
import { Permission, assertsIsPermission } from "~/server/api/utils/permissions";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: SessionUser;
  }

  interface User {
    id: PrismaUser["id"];
    permissions: string;

    // ...other properties
    // role: UserRole;
  }

  interface SessionUser extends Omit<User, "permissions"> {
    permissions: Permission[];
  }
}


const getPermissionArray = (permissionsString: string): Permission[] => {
  const uncheckedStringArray = permissionsString.split(",");

  if (!uncheckedStringArray.length) throw "uncheckedStringArray is empty";


  const permissionArray = uncheckedStringArray.map((uncheckedString) => {
    assertsIsPermission(uncheckedString);

    return uncheckedString;
  });


  return permissionArray;
}


/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        if (typeof user.id !== "number") {    //TODO: figure out if forcing the type of `id` to be `number` is going to cause problems
          console.log('typeof user.id !== "number"');

          const idAsNumber = Number(user.id);

          if (isNaN(idAsNumber)) throw "user.id is NaN";

          user.id = idAsNumber;
        };

        session.user.id = user.id;
        session.user.permissions = getPermissionArray(user.permissions);
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

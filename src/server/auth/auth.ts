import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { customPrismaAdapter } from "./prismaAdapter"; 
import { User as PrismaUser, User_AccountStatus as PrismaUserAccountStatus } from "@prisma/client";
import { prisma } from "~/server/prisma";
import { Permission, assertsIsPermission } from "~/server/api/utils/permissions";
import { discordProviderConfig } from "./discordProviderConfig";

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
    permissions: PrismaUser["permissions"];
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
};


/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.permissions = getPermissionArray(user.permissions);
      }
      return session;
    },
  },
  adapter: customPrismaAdapter(prisma),
  providers: [
    DiscordProvider(discordProviderConfig),
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




type CommonProfileCallbackParams = {
  showCompletedMaps: boolean;
  permissions: string;
  accountStatus: PrismaUserAccountStatus;
  timeDeletedOrBanned: number | null;
}

export const commonProfileCallbackParams: CommonProfileCallbackParams = {
  showCompletedMaps: false,
  permissions: "",
  accountStatus: "Active",
  timeDeletedOrBanned: null,
};
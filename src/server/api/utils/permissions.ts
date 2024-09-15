import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { SessionUser } from "next-auth";




const permissionArray = ["Super_Admin", "Admin", "Map_Moderator", "Map_Reviewer"] as const;
export type Permission = typeof permissionArray[number];

const getPermissions = <T extends readonly Permission[]>(array: T) => {
  return array;
};


export const ADMIN_PERMISSION_STRINGS = getPermissions(["Super_Admin", "Admin"] as const);
export type AdminPermissionString = typeof ADMIN_PERMISSION_STRINGS[number];


export const MODLIST_MODERATOR_PERMISSION_STRINGS = getPermissions(["Super_Admin", "Admin", "Map_Moderator"] as const);
export type ModlistModeratorPermissionString = typeof MODLIST_MODERATOR_PERMISSION_STRINGS[number];


export const MOD_REVIEWER_PERMISSION_STRINGS = getPermissions(["Super_Admin", "Admin", "Map_Moderator", "Map_Reviewer"] as const);
export type ModReviewerPermissionString = typeof MODLIST_MODERATOR_PERMISSION_STRINGS[number];




export function assertsIsPermission(item: string): asserts item is Permission {
  for (const permission of permissionArray) if (permission === item) return;

  throw `"${item}" is not a valid permission`;
}


export const checkPermissions = (validPermissionsArray: readonly Permission[], userPermissionsArray?: Permission[]): boolean => {
  if (!userPermissionsArray || !userPermissionsArray.length) return false;


  for (const validPermission of validPermissionsArray) {
    for (const userPermission of userPermissionsArray) {
      if (userPermission === validPermission) {
        return true;
      }
    }
  }


  return false;
};



/**
 *  throws on failure
 */
export const checkIsPrivileged = (validPermissionsArray: readonly Permission[], sessionUser: SessionUser, targetUserIdOrArray: string | string[]): void => {
  if (Array.isArray(targetUserIdOrArray)) {
    for (const targetUserId of targetUserIdOrArray) {
      if (sessionUser.id === targetUserId) return;
    }
  } else {
    if (sessionUser.id === targetUserIdOrArray) return;
  }


  const isPrivileged = checkPermissions(validPermissionsArray, sessionUser.permissions);

  if (!isPrivileged) throw new TRPCError({
    code: "FORBIDDEN",
  });
};
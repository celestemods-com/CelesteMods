import { Prisma } from "@prisma/client";




const permissionArray = ["Super_Admin", "Admin", "Map_Moderator", "Map_Reviewer"] as const;
export type Permission = typeof permissionArray[number];

const getPermissions = <T extends readonly Permission[]> (array: T) => {
    return array;
}


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
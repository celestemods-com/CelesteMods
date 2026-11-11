import type { Permission } from "../server/api/utils/permissions";




export const isPermitted = (userPermissions: Permission[], validPermissionsArray: readonly Permission[]): boolean => {
    if (!userPermissions.length) return false;


    for (const validPermission of validPermissionsArray) {
        for (const userPermission of userPermissions) {
            if (userPermission === validPermission) {
                return true;
            }
        }
    }


    return false;
};
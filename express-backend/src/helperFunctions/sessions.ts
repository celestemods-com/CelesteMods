import { Request, Response } from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";
import { toErrorWithMessage } from "./errorHandling";
import { session } from ".prisma/client";
import { discordUser } from "../types/discord";
import { formattedSession } from "../types/frontend";
import { sessionData } from "../types/sessions";
import { permissions } from "../types/frontend";


export const noUserWithDiscordIdErrorMessage = "No user found matching given discordUser";




export const adminPermsArray: permissions[] = ["Super_Admin", "Admin"];
export const mapStaffPermsArray: permissions[] = ["Super_Admin", "Admin", "Map_Moderator"];
export const mapReviewersPermsArray: permissions[] = ["Super_Admin", "Admin", "Map_Moderator", "Map_Reviewer"];


export const checkPermissions = async function (req: Request, validPermissionsArray: permissions[], checkSessionAgeBool = true, res?: Response) {
    if (!req.session || !req.session.userID) {
        if (res) res.sendStatus(401);

        return false;
    }


    if (checkSessionAgeBool) {
        const sessionAgeBool = await checkSessionAge(req);

        if (!sessionAgeBool) {
            if (res) {
                res.sendStatus(401);
            }

            return false;
        }
    }


    if (validPermissionsArray && !validPermissionsArray.length && req.session.userID) return true;


    const userPermissionsArray = req.session.permissions;


    if (userPermissionsArray === undefined) {
        if (res) res.sendStatus(403);

        return false;
    }


    let permitted = false;

    if (userPermissionsArray && userPermissionsArray.length) {
        outerLoop: for (const userPerm of userPermissionsArray) {
            for (const validPerm of validPermissionsArray) {
                if (userPerm === validPerm) {
                    permitted = true;
                    break outerLoop;
                }
            }
        }
    }


    if (!permitted && res) res.sendStatus(403);


    return permitted;
}




export const checkSessionAge = async function (req: Request, res?: Response) {
    if (!req.session || !req.session.cookie || !req.session.cookie.maxAge || req.session.refreshCount === undefined) return false;


    //if cookie is more than an hour old and still refreshable, refresh it
    if (req.session.cookie.originalMaxAge - (60 * 60 * 1000) > req.session.cookie.maxAge) {

        if (req.session.refreshCount >= 20) {
            await revokeSessionAsync(req);

            if (res) res.sendStatus(401);

            return false;
        }
        else {
            await regenerateSessionAsync(req);
            req.session.refreshCount++;
        }
    }


    return true;
}




export const formatSession = function (rawSession: session) {
    const sessionData: sessionData = JSON.parse(rawSession.data);


    const formattedSession: formattedSession = {
        sid: rawSession.sid,
        sessionExpiryTime: sessionData.cookie.expires,
        refreshCount: sessionData.refreshCount,
        userID: sessionData.userID,
    };


    return formattedSession;
}





export const storeIdentityInSession = async function (req: Request, discordUser: discordUser, updateDiscordBool: boolean) {
    try {
        const celestemodsUser = await prisma.users.findUnique({ where: { discordID: discordUser.id } });

        if (!celestemodsUser) throw noUserWithDiscordIdErrorMessage;


        if (updateDiscordBool) {
            const updatedUser = await prisma.users.update({
                where: { discordID: discordUser.id },
                data: {
                    discordUsername: discordUser.username,
                    discordDiscrim: discordUser.discriminator,
                },
                include: {
                    users_to_maps: true,
                    publishers: true,
                },
            });

            if (!updatedUser) throw noUserWithDiscordIdErrorMessage;


            req.session.refreshCount = 0;
            req.session.userID = updatedUser.id;
            req.session.permissions = <permissions[]>updatedUser.permissions.split(",");


            return updatedUser;
        }
        else {
            req.session.refreshCount = 0;
            req.session.userID = celestemodsUser.id;
            req.session.permissions = <permissions[]>celestemodsUser.permissions.split(",");


            return true;
        }
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}





export const regenerateSessionAsync = (req: Request) => {
    return new Promise<void>((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) return reject(error);

            resolve();
        });
    });
}


export const revokeSessionAsync = (req: Request,) => {
    return new Promise<void>((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) return reject(error);

            resolve();
        });
    });
}
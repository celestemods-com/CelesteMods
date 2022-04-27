import { Request } from "express";
import { prisma } from "../prismaClient";
import { errorWithMessage, toErrorWithMessage } from "../errorHandling";
import { session, users, golden_players, publishers } from ".prisma/client";
import { discordUser } from "../types/discord";
import { formattedSession } from "../types/frontend";
import { sessionData } from "../types/sessions";
import { permissions } from "../types/internal";


export const noUserWithDiscordIdErrorMessage = "No user found matching given discordUser";




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
        if (updateDiscordBool) {
            const updatedUser = await prisma.users.update({
                where: { discordID: discordUser.id },
                data: {
                    discordUsername: discordUser.username,
                    discordDiscrim: discordUser.discriminator,
                },
                include: {
                    publishers: true,
                    golden_players: true,
                }
            });

            if (!updatedUser) throw noUserWithDiscordIdErrorMessage;


            await regenerateSessionAsync(req);

            req.session.refreshCount = 0;
            req.session.userID = updatedUser.id;
            req.session.permissions = <permissions[]>updatedUser.permissions.split(",");


            return updatedUser;
        }
        else {
            const celestemodsUser = await prisma.users.findUnique({ where: { discordID: discordUser.id } });

            if (!celestemodsUser) throw noUserWithDiscordIdErrorMessage;


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


export const revokeSessionAsync = (req: Request, sessionId?: string) => {
    if (sessionId) {
        return new Promise<void>((resolve, reject) => {
            reject("not implemented yet");      //TODO: implement destroying session based on SID
        })
    }
    else {
        return new Promise<void>((resolve, reject) => {
            req.session.destroy((error) => {
                if (error) return reject(error);

                resolve();
            });
        });
    }
}
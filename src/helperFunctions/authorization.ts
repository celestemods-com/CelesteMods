import express, { Request, Response } from "express";
import session from "express-session";
import axios from "axios";
import { prisma } from "../prismaClient";
import { isErrorWithMessage, toErrorWithMessage } from "../errorHandling";
import { getCurrentTime } from "../helperFunctions/utils";
import { discordUser } from "../types/discord";


export const noUserWithDiscordIdErrorMessage = "No user found matching given discordUser";





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

            req.session.userID = updatedUser.id;
            req.session.refreshCount = 0;


            return updatedUser;
        }
        else {
            const celestemodsUser = await prisma.users.findUnique({ where: { discordID: discordUser.id } });

            if (!celestemodsUser) throw noUserWithDiscordIdErrorMessage;


            return true;
        }
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}






export const getDiscordUser = async function (res: Response, discordTokenType: string, discordToken: string) {
    try {
        const options = {
            url: "https://discord.com/api/users/@me",
            headers: { authorization: `${discordTokenType} ${discordToken}` },
        };


        const axiosResponse = await axios(options);


        if (axiosResponse.status === 401) {
            res.json("Token and/or tokenType were rejected by Discord");
            res.errorSent = true;
            return;
        }
        else if (axiosResponse.status != 200) {
            res.json("Discord api not responding as expected.");
            res.errorSent = true;
            return;
        }


        const discordUser: discordUser = {
            id: String(axiosResponse.data.id),
            username: String(axiosResponse.data.username),
            discriminator: String(axiosResponse.data.discriminator)
        }

        if (!isDiscordUser(discordUser)) throw "improperly formed discordUser";


        return discordUser;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}


const isDiscordUser = function (discordUser: unknown): discordUser is discordUser {
    if (
        discordUser && typeof discordUser === "object" &&      //discordUser exists and is an object
        "id" in discordUser && "username" in discordUser && "discriminator" in discordUser      //discordUser contains the correct properties
    ) {
        if (        //the properties are all the correct type
            typeof (discordUser as discordUser).id === "string" &&
            typeof (discordUser as discordUser).id === "string" &&
            typeof (discordUser as discordUser).id === "string"
        ) {
            return true;    //all checks passed
        }
    }


    return false;   //not all checks passed
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
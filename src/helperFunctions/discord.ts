import { Response } from "express";
import axios from "axios";
import { toErrorWithMessage } from "../errorHandling";
import { discordUser } from "../types/discord";




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
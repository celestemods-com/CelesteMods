import { Response } from "express";
import axios from "axios";
import { discordUser } from "../types/discord";
import { Method } from "axios";




export const getDiscordUserFromCode = async function (res: Response, code: string) {
    const tokenData = await getDiscordAuthTokenFromCode(res, code);

    if (!tokenData) return;

    const token = tokenData.accessToken;
    const tokenType = tokenData.tokenType;


    const discordUser = await getDiscordUserFromToken(res, tokenType, token);


    await revokeDiscordToken(res, token);
    if (res.errorSent) return;


    return discordUser;
}




const getDiscordAuthTokenFromCode = async function (res: Response, code: string) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (typeof clientId !== "string" || typeof clientSecret !== "string" || typeof redirectUri !== "string") {
        throw "non-string discord oauth parameter. check .env";
    }


    const data = new URLSearchParams();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", redirectUri);

    const options = {
        method: <Method>"post",     //typescript gets mad when the options are given to axios if this isn't cast as Method
        url: "https://discord.com/api/oauth2/token",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: data,
    };

    const axiosResponse = await axios(options);


    if (axiosResponse.status === 401) {
        res.json("Code was rejected by Discord");
        res.errorSent = true;
        return;
    }
    else if (axiosResponse.status != 200) {
        res.json("Discord api not responding as expected.");
        res.errorSent = true;
        return;
    }


    const tokenData = {
        accessToken: axiosResponse.data.access_token,
        tokenType: axiosResponse.data.token_type,
    };

    return tokenData;
}




const getDiscordUserFromToken = async function (res: Response, discordTokenType: string, discordToken: string) {
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




const revokeDiscordToken = async function (res: Response, token: string) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (typeof clientId !== "string" || typeof clientSecret !== "string") {
        throw "non-string discord oauth parameter. check .env";
    }


    const data = new URLSearchParams();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("token", token);

    const options = {
        method: <Method>"post",     //typescript gets mad when the options are given to axios if this isn't cast as Method
        url: "https://discord.com/api/oauth2/token/revoke",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        data: data,
    };

    const axiosResponse = await axios(options);


    if (axiosResponse.status != 200) {
        res.json("Discord api not responding as expected.");
        res.errorSent = true;
    }
}
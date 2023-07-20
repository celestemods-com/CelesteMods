import { DiscordProfile } from "next-auth/providers/discord";
import { env } from "~/env.mjs";
import { Awaitable } from "next-auth";
import { User } from "@prisma/client";
import { commonProfileCallbackParams } from "./auth";



//TODO!: add functionality to intercept typical auth flow for "unlinked" users and redirect them to a page where they can link their account. probably in ./auth.ts
const profileCallback = (profile: DiscordProfile): Awaitable<User> => {
    if (profile.avatar === null) {
        const defaultAvatarNumber = (
            parseInt(profile.discriminator) ||
            Math.random() * 10000   //if the discriminator is not a number (or is 0), use a random number
        ) % 5;
        profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
    } else {
        const format = profile.avatar.startsWith("a_") ? "gif" : "png";
        profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
    }


    return {
        id: profile.id,
        name: profile.username,
        image: profile.image_url,
        discordUsername: profile.username,
        discordDiscriminator: profile.discriminator,
        displayDiscord: false,
        ...commonProfileCallbackParams,
    };
};




export const discordProviderConfig = {
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    profile: profileCallback,
};
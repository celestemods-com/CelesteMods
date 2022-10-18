import { prisma } from "../middlewaresAndConfigs/prismaClient";
import { expressRoute } from "../types/express";
import { toErrorWithMessage } from "./errorHandling";
import { formattedUser, permissions } from "../types/frontend";
import { rawUser } from "../types/internal";
import { isNumberArray } from "../helperFunctions/utils";





export const param_userID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.userID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("userID is not a number");
            return;
        }

        const exists = await prisma.users.findUnique({ where: { id: id } });

        if (!exists) {
            res.status(404).json("userID does not exist");
            return;
        }

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
}





export const formatPartialUser = function (rawUser: rawUser) {
    try {
        if (rawUser.accountStatus === "Deleted" || rawUser.accountStatus === "Banned") {
            const trimmedUser = formatTrimmedUser(rawUser);

            return trimmedUser;
        }


        const formattedUser: formattedUser = {
            id: rawUser.id,
            displayName: rawUser.displayName,
            displayDiscord: rawUser.displayDiscord,
            timeCreated: rawUser.timeCreated,
            accountStatus: rawUser.accountStatus,
            showCompletedMaps: rawUser.showCompletedMaps,
        };


        const gamebananaIDsArray = rawUser.publishers.map((publisher) => {
            return publisher.gamebananaID;
        });

        if (isNumberArray(gamebananaIDsArray)) {
            formattedUser.gamebananaIDs = gamebananaIDsArray;
        }


        if (rawUser.displayDiscord) {
            formattedUser.discordUsername = rawUser.discordUsername;
            formattedUser.discordDescrim = rawUser.discordDiscrim;
        }


        if (rawUser.showCompletedMaps) {
            const mapIDsArray = rawUser.users_to_maps.map((row) => {
                return row.mapID;
            });

            if (isNumberArray(mapIDsArray)) {
                formattedUser.completedMapIDs = mapIDsArray;
            }
        }


        return formattedUser;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}


export const formatFullUser = function (rawUser: rawUser) {
    try {
        if (rawUser.accountStatus === "Deleted" || rawUser.accountStatus === "Banned") {
            const trimmedUser = formatTrimmedUser(rawUser);

            return trimmedUser;
        }


        const permissionsArray = <permissions[]>rawUser.permissions.split(",");


        const formattedUser: formattedUser = {
            id: rawUser.id,
            displayName: rawUser.displayName,
            discordUsername: rawUser.discordUsername,
            discordDescrim: rawUser.discordDiscrim,
            displayDiscord: rawUser.displayDiscord,
            timeCreated: rawUser.timeCreated,
            accountStatus: rawUser.accountStatus,
            permissions: permissionsArray,
            showCompletedMaps: rawUser.showCompletedMaps,
        };


        const gamebananaIDsArray = rawUser.publishers.map((publisher) => {
            return publisher.gamebananaID;
        });

        if (isNumberArray(gamebananaIDsArray)) {
            formattedUser.gamebananaIDs = gamebananaIDsArray;
        }


        const mapIDsArray = rawUser.users_to_maps.map((row) => {
            return row.mapID;
        });

        if (isNumberArray(mapIDsArray)) {
            formattedUser.completedMapIDs = mapIDsArray;
        }


        return formattedUser;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}


const formatTrimmedUser = function (rawUser: rawUser) {
    const timeDeletedOrBanned = rawUser.timeDeletedOrBanned === null ? undefined : rawUser.timeDeletedOrBanned;


    const trimmedUser: formattedUser = {
        id: rawUser.id,
        displayName: rawUser.displayName,
        accountStatus: rawUser.accountStatus,
        timeDeletedOrBanned: timeDeletedOrBanned,
    }


    return trimmedUser;
}




export const getUser = async function (submitterUserID: number) {
    const userFromID = await prisma.users.findUnique({ where: { id: submitterUserID } });

    if (!userFromID) return;

    return userFromID;
}
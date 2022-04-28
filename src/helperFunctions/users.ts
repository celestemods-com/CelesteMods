import { prisma } from "../prismaClient";
import { expressRoute } from "../types/express"; import { toErrorWithMessage } from "../errorHandling";
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
            goldenPlayerID: rawUser.golden_players?.id,
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


        const permissionsArray = <permissions[]>rawUser.permissions.split(",")


        const formattedUser: formattedUser = {
            id: rawUser.id,
            displayName: rawUser.displayName,
            discordUsername: rawUser.discordUsername,
            discordDescrim: rawUser.discordDiscrim,
            displayDiscord: rawUser.displayDiscord,
            timeCreated: rawUser.timeCreated,
            accountStatus: rawUser.accountStatus,
            permissions: permissionsArray,
            goldenPlayerID: rawUser.golden_players?.id,
        };


        const gamebananaIDsArray = rawUser.publishers.map((publisher) => {
            return publisher.gamebananaID;
        });

        if (isNumberArray(gamebananaIDsArray)) {
            formattedUser.gamebananaIDs = gamebananaIDsArray;
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
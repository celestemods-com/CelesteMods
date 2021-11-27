import express from "express";
import axios from "axios";
import ajvModule from "ajv";
import { prisma } from "../prismaClient";
import { errorWithMessage, isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler } from "../errorHandling";
import { users } from ".prisma/client";
import { formattedUser } from "../types/frontend";
import { createUserData, updateUserData, rawUser } from "../types/internal";
import { discordUser } from "../types/discord";
import { isNumberArray } from "../utils";


const router = express.Router();
const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        discordToken: { type: "string" },
        discordTokenType: { type: "string" },
        displayName: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: "boolean" },
        gamebananaIDs: {
            type: "array",
            items: { anyOf: [{ type: "integer" }] },
        },
        goldenPlayerID: { type: "integer" },
    },
    additionalProperties: false,
    required: ["discordToken", "discordTokenType", "displayName", "displayDiscord",],   //for production
    //required: ["displayName", "displayDiscord"],      //for testing
};
const patchSchema = {
    type: "object",
    properties: {
        displayName: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: "boolean" },
        gamebananaIDs: {
            type: "array",
            items: { anyOf: [{ type: "integer" }] },
        },
        goldenPlayerID: { type: "integer" },
    },
    additionalProperties: false,
};
const putSchema = {
    type: "object",
    properties: {
        discordToken: { type: "string" },
        discordTokenType: { type: "string" },
    }
}

const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);
const validatePut = ajv.compile(putSchema);




router.param("userID", async function (req, res, next) {
    const idRaw: unknown = req.params.userID;

    const id = Number(idRaw);

    if (isNaN(id)) {
        res.status(400).json("userID is not a number");
        return;
    }

    const userFromId = await prisma.users.findUnique({ where: { id: id } });
    if (!userFromId) {
        res.status(404).json("userID does not exist");
        return;
    }

    if (userFromId.accountStatus === "Active") {
        req.valid = true;
    }
    else {
        req.valid = false;
    }

    req.id = id;
    next();
});




router.param("gamebananaID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.gamebananaID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("gamebananaID is not a number");
            return;
        }

        const publisherFromId = await prisma.publishers.findUnique({ where: { gamebananaID: id } });
        if (!publisherFromId) {
            res.status(404).json("gamebananaID does not exist");
            return;
        }

        const matchingUsers = await prisma.users.findMany({
            where: {
                OR: [
                    { id: req.id },
                    { publishers: { some: { gamebananaID: id } } },
                ]
            },
            include: { publishers: true },
        });

        if (matchingUsers.length > 1) { //length cannot be 0. the userID has already been checked as valid, so at least 1 user will be returned
            if (matchingUsers.length > 2) {
                console.log(`gamebananaID ${id} is associated with multiple publishers`);
            }

            req.valid, req.idsMatch = false;
        }
        else {
            req.valid = true;

            req.idsMatch = false;

            for (const publisher of matchingUsers[0].publishers) {
                if (publisher.gamebananaID === id) {
                    req.idsMatch = true;
                    break;
                }
            }
        }

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const users = await prisma.users.findMany({
                include: {
                    publishers: { select: { gamebananaID: true } },
                    golden_players: { select: { id: true } },
                },
            });
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const discordToken: string = req.body.discordToken;         //can't be null after validatePost call
            const discordTokenType: string = req.body.discordTokenType; //can't be null after validatePost call
            const displayName: string = req.body.displayName;           //can't be null after validatePost call
            const displayDiscord: boolean = req.body.displayDiscord;    //can't be null after validatePost call
            const gamebananaIDsArray: number[] | undefined = req.body.gamebananaIDs;
            const goldenPlayerID: number | undefined = req.body.goldenPlayerID;

            const valid = validatePost({
                discordToken: discordToken, //comment out for testing
                discordTokenType: discordTokenType, //comment out for testing
                displayName: displayName,
                displayDiscord: displayDiscord,
                gamebananaIDs: gamebananaIDsArray,
                goldenPlayerID: goldenPlayerID,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            //for production
            const discordUser = await getDiscordUser(discordTokenType, discordToken);

            if (isErrorWithMessage(discordUser)) {
                throw discordUser;
            }

            const discordID = discordUser.id;
            const discordUsername = discordUser.username;
            const discordDiscrim = discordUser.discriminator;

            //for testing
            // const discordID = <string>req.body.testID;
            // const discordUsername = <string>req.body.discordUsername;
            // const discordDiscrim = <string>req.body.discordDiscrim;


            let arrayForOR: {}[] = [];

            if (gamebananaIDsArray && gamebananaIDsArray.length) {
                arrayForOR = gamebananaIDsArray.map((id: number) => {
                    return { gamebananaID: id };
                });
            }

            let matchingUser = await prisma.users.findFirst({
                where: {
                    OR: [
                        { discordID: discordID },
                        { publishers: { some: { OR: arrayForOR } } },
                    ],
                },
            });

            if (matchingUser) {
                res.status(400).json("discordID or gamebananaID already connected to a user account");
                return;
            }


            const createData: createUserData = {
                displayName: displayName,
                discordID: discordID,
                discordUsername: discordUsername,
                discordDiscrim: discordDiscrim,
                displayDiscord: displayDiscord,
                timeCreated: Math.floor(new Date().getTime() / 1000),
                permissions: "",
            }

            if (gamebananaIDsArray && gamebananaIDsArray.length) {
                const createOrConnectArray: {}[] = gamebananaIDsArray.map((id) => {
                    return { create: { gamebananaID: id }, where: { gamebananaID: id } };
                });

                createData.publishers = { connectOrCreate: createOrConnectArray };
            }

            if (goldenPlayerID) {
                const goldenPlayer = await prisma.golden_players.findUnique({
                    where: { id: goldenPlayerID }
                });

                if (!goldenPlayer) {
                    res.status(404).json("Golden Player not found");
                    return;
                }

                const matchingUser = await prisma.users.findFirst({ where: { golden_players: { id: goldenPlayerID } } });

                if (matchingUser) {
                    res.status(400).json("goldenPlayerID already connected to a user account");
                    return;
                }

                createData.golden_players = { connect: { id: goldenPlayerID } };
            }


            const user = await prisma.users.create({
                data: createData,
                include: {
                    publishers: true,
                    golden_players: true,
                },
            });


            res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/search")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawUsers = await prisma.users.findMany({
                where: { displayName: { startsWith: query } },
                include: {
                    publishers: true,
                    golden_players: true,
                },
            });


            const formattedUsers: formattedUser[] = [];

            for (const rawUser of rawUsers) {
                const formattedUser = formatUser(rawUser);

                if (isErrorWithMessage(formattedUser)) throw formattedUser;

                formattedUsers.push(formattedUser);
            }


            res.json(formattedUsers);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/gamebanana/:gamebananaID")
    .get(async function (req, res, next) {
        try {
            const rawUser = await prisma.users.findFirst({
                where: { publishers: { some: { gamebananaID: req.id2 } } },
                include: {
                    publishers: true,
                    golden_players: true,
                }
            });


            if (!rawUser) {
                res.sendStatus(204);
                return;
            }


            const formattedUser = formatUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;


            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID/gamebanana/:gamebananaID")
    .post(async function (req, res, next) {
        try {
            if (!req.valid) {
                res.status(400).json("gamebananaID already linked to another user");
                return;
            }

            if (!req.idsMatch) {
                const gamebananaID = <number>req.id2; //can cast as "number" because the router.param already checked that the id is valid

                await prisma.users.update({
                    where: { id: req.id },
                    data: {
                        publishers: {
                            connectOrCreate: {
                                where: { gamebananaID: gamebananaID },
                                create: { gamebananaID: gamebananaID },
                            }
                        },
                    },
                });
            }

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            if (!req.valid) {
                res.status(400).json("gamebananaID linked to a different user");
                return;
            }

            if (!req.idsMatch) {
                res.status(400).json("gamebananaID not linked to specified user");
                return;
            }

            await prisma.users.update({
                where: { id: req.id },
                data: { publishers: { disconnect: { gamebananaID: req.id2 } } },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID")
    .get(async function (req, res, next) {
        try {
            const rawUser = await prisma.users.findUnique({
                where: { id: req.id },
                include: {
                    publishers: true,
                    golden_players: true,
                },
            });
            if (!rawUser) throw "rawUser is null!";

            const formattedUser = formatUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const displayName: string | undefined = req.body.displayName;
            const displayDiscord: boolean | undefined = req.body.displayDiscord;
            const gamebananaIDsArray: number[] | undefined = req.body.gamebananaIDs;
            const goldenPlayerID: number | undefined = req.body.goldenPlayerID;

            const valid = validatePatch({
                displayName: displayName,
                displayDiscord: displayDiscord,
                gamebananaIDs: gamebananaIDsArray,
                goldenPlayerID: goldenPlayerID,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            if (!req.valid) {
                res.status(403).json("Deleted or banned accounts cannot be updated");
                return;
            }


            const updateUserData: updateUserData = {
                displayName: displayName,
                displayDiscord: displayDiscord,
            };

            if (gamebananaIDsArray) {
                const createOrConnectArray: {}[] = gamebananaIDsArray.map((id) => {
                    return { create: { gamebananaID: id }, where: { gamebananaID: id } };
                });

                updateUserData.publishers = { connectOrCreate: createOrConnectArray };
            }

            if (goldenPlayerID) {
                const goldenPlayer = await prisma.golden_players.findUnique({
                    where: { id: goldenPlayerID }
                });

                if (!goldenPlayer) {
                    res.status(404).json("Golden Player not found");
                    return;
                }

                updateUserData.golden_players = { connect: { id: goldenPlayerID } };
            }
            else if (goldenPlayerID === 0) {
                updateUserData.golden_players = { disconnect: true };
            }


            const rawUser = await prisma.users.update({
                where: { id: req.id },
                data: updateUserData,
                include: {
                    publishers: true,
                    golden_players: true,
                }
            });

            const formattedUser = formatUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(error);
        }
    })
    .put(async function (req, res, next) {
        try {
            //for production
            const discordToken: string = req.body.discordToken;         //can't be undefined after validatePut
            const discordTokenType: string = req.body.discordTokenType; //can't be undefined after validatePut

            const valid = validatePut({
                discordToken: discordToken,
                discordTokenType: discordTokenType,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const discordUser = await getDiscordUser(discordTokenType, discordToken);

            if (isErrorWithMessage(discordUser)) {
                throw discordUser;
            }

            //for testing
            // const discordUser = {
            //     id: req.body.testID,
            //     username: req.body.username,
            //     discriminator: req.body.discrim,
            // };

            const discordID = discordUser.id;
            const discordUsername = discordUser.username;
            const discordDiscrim = discordUser.discriminator;


            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.discordID != discordID && userFromId.discordID != null) {
                res.status(400).json("The discordID assigned to the specified user does not match the ID retrieved with the provided discordToken");
                return;
            }

            if (userFromId.accountStatus != "Active") {
                res.status(403).json("Deleted or banned accounts cannot be updated");
                return;
            }


            const updatedUser = await prisma.users.update({
                where: { id: req.id },
                data: {
                    discordUsername: discordUsername,
                    discordDiscrim: discordDiscrim,
                },
                include: {
                    publishers: true,
                    golden_players: true,
                }
            });


            const formattedUser = formatUser(updatedUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID/delete")
    .post(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Banned") {
                res.status(403).json("Banned accounts cannot be deleted");
                return;
            }

            if (userFromId.accountStatus === "Deleted") {
                res.status(200).json(userFromId.timeDeletedOrBanned);
                return;
            }

            await prisma.users.update({
                where: { id: req.id },
                data: {
                    accountStatus: "Deleted",
                    timeDeletedOrBanned: Math.floor(new Date().getTime() / 1000),
                },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Banned") {
                res.status(403).json("Banned accounts cannot be deleted");
                return;
            }

            if (userFromId.accountStatus === "Active") {
                res.sendStatus(200);
                return;
            }

            await prisma.users.update({
                where: { id: req.id },
                data: {
                    accountStatus: "Active",
                    timeDeletedOrBanned: null,
                },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID/ban")
    .post(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Banned") {
                res.status(200).json(userFromId.timeDeletedOrBanned);
                return;
            }

            await prisma.users.update({
                where: { id: req.id },
                data: {
                    accountStatus: "Banned",
                    timeDeletedOrBanned: Math.floor(new Date().getTime() / 1000),
                },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Active") {
                res.sendStatus(200);
                return;
            }

            await prisma.users.update({
                where: { id: req.id },
                data: {
                    accountStatus: "Active",
                    timeDeletedOrBanned: null,
                },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID/permissions")
    .get(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } });    //can cast as "users" because the router.param already checked that the id is valid

            res.status(200).json(userFromId.permissions);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const permissionsArray: string[] | undefined = req.body.permissions;

            if (!permissionsArray) {
                res.status(400).json("Must include 'permissions'");
                return;
            }
            else if (permissionsArray.constructor != Array) {
                res.status(400).json("'permissions' must be an array");
                return;
            }


            let permissionsString = "";

            for (const element of permissionsArray) {
                if (
                    element === "Super_Admin" ||
                    element === "Admin" ||
                    element === "Map_Moderator" ||
                    element === "Map_Reviewer" ||
                    element === "Golden_Verifier" ||
                    element === ""
                ) {
                    permissionsString += ",";
                    permissionsString += element;
                }
                else {
                    res.status(400).json(`${element} is not a valid permission`);
                    return;
                }
            }

            await prisma.users.update({
                where: { id: req.id },
                data: { permissions: permissionsString },
            });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.route("/:userID/submissions/feedback")
    .get(async function (req, res, next) {
        try {
            const feedbackObjects = await prisma.general_feedback_submissions.findMany({
                where: { users: { id: req.id } },
            });

            res.json(feedbackObjects);
        }
        catch (error) {
            next(error);
        }
    })
    .all(function (_req, res, next) {
        try {
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




router.use(noRouteError);

router.use(errorHandler);




const formatUser = function (rawUser: rawUser): formattedUser | errorWithMessage {
    try {
        if (rawUser.accountStatus === "Deleted" || rawUser.accountStatus === "Banned") {
            const timeDeletedOrBanned = rawUser.timeDeletedOrBanned === null ? undefined : rawUser.timeDeletedOrBanned;

            const trimmedUser: formattedUser = {
                id: rawUser.id,
                displayName: rawUser.displayName,
                accountStatus: rawUser.accountStatus,
                timeDeletedOrBanned: timeDeletedOrBanned,
            }
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




const getDiscordUser = async function (tokenType: String, token: String): Promise<discordUser | errorWithMessage> {
    try {
        const options = {
            url: "https://discord.com/api/users/@me",
            headers: { authorization: `${tokenType} ${token}` },
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            const error = new Error("Discord api not responding as expected.");
            throw error;
        }

        const discordUser: discordUser = {
            id: String(axiosResponse.data.id),
            username: String(axiosResponse.data.username),
            discriminator: String(axiosResponse.data.discriminator)
        }

        return discordUser;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}

export { router as usersRouter, formatUser };
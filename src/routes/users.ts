import express from "express";
import { prisma } from "../prismaClient";
import { getDiscordUser } from "../helperFunctions/discord";
import { storeIdentityInSession } from "../helperFunctions/sessions";
import { validatePost, validatePatch1, validatePatch2 } from "../jsonSchemas/users";
import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { users } from ".prisma/client";
import { formattedUser } from "../types/frontend";
import { createUserData, updateUserData, rawUser } from "../types/internal";
import { formatPartialUser, formatFullUser } from "../helperFunctions/users";


const router = express.Router();




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
    req.name = userFromId.displayName;
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

        if (matchingUsers.length < 1) {
            req.valid, req.idsMatch = false;
        }
        else if (matchingUsers.length > 1) {
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
        next(toErrorWithMessage(error));
    }
});




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawUsers = await prisma.users.findMany({
                include: {
                    publishers: true,
                    golden_players: true,
                },
            });


            const formattedUsers = rawUsers.map((rawUser) => {
                const formattedUser = formatPartialUser(rawUser);

                if (isErrorWithMessage(formattedUser)) return `Formatting failed for user ${rawUser.id}`;

                return formattedUser;
            })


            res.json(formattedUsers);
        }
        catch (error) {
            next(toErrorWithMessage(error));
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
            const generateSessionBool: boolean | undefined = req.body.generateSessionBool;


            const valid = validatePost({
                discordToken: discordToken, //comment out for testing
                discordTokenType: discordTokenType, //comment out for testing
                displayName: displayName,
                displayDiscord: displayDiscord,
                gamebananaIDs: gamebananaIDsArray,
                goldenPlayerID: goldenPlayerID,
                generateSessionBool: generateSessionBool,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            //for production
            const discordUser = await getDiscordUser(res, discordTokenType, discordToken);

            if (!discordUser) return;
            else if (isErrorWithMessage(discordUser)) throw discordUser;

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


            const rawUser = await prisma.users.create({
                data: createData,
                include: {
                    publishers: true,
                    golden_players: true,
                },
            });


            const formattedUser = formatFullUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;


            if (generateSessionBool) {
                const success = await storeIdentityInSession(req, discordUser, false);

                if (success !== true) throw success;


                const sessionExpiryTime = req.session.cookie.expires;
                const refreshCount = req.session.refreshCount ? req.session.refreshCount : 0;


                const responseObject = {
                    sessionExpiryTime: sessionExpiryTime,
                    refreshCount: refreshCount,
                    celestemodsUser: formattedUser,
                };


                res.status(201).json(responseObject);
            }
            else {
                res.status(201).json(formattedUser);
            }
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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
                const formattedUser = formatPartialUser(rawUser);

                if (isErrorWithMessage(formattedUser)) throw formattedUser;

                formattedUsers.push(formattedUser);
            }


            res.json(formattedUsers);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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


            const formattedUser = formatPartialUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;


            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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
                                create: {
                                    gamebananaID: gamebananaID,
                                    name: <string>req.name,     //if we make it here from the router.param for userID, then this will always be a string
                                },
                            }
                        },
                    },
                });
            }

            res.sendStatus(204);
        }
        catch (error) {
            next(toErrorWithMessage(error));
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
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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

            const formattedUser = formatPartialUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .patch(async function (req, res, next) {
        try {
            const displayName: string | undefined = req.body.displayName;
            const displayDiscord: boolean | undefined = req.body.displayDiscord;
            const gamebananaIDsArray: number[] | undefined = req.body.gamebananaIDs;
            const goldenPlayerID: number | undefined = req.body.goldenPlayerID;

            const valid = validatePatch1({
                displayName: displayName,
                displayDiscord: displayDiscord,
                gamebananaIDs: gamebananaIDsArray,
                goldenPlayerID: goldenPlayerID,
            });

            if (!valid || (!displayName && !displayDiscord && !gamebananaIDsArray && !goldenPlayerID)) {
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

            const formattedUser = formatFullUser(rawUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/:userID/discord")
    .patch(async function (req, res, next) {
        try {
            //for production
            const discordToken: string = req.body.discordToken;         //can't be undefined after validatePatch2
            const discordTokenType: string = req.body.discordTokenType; //can't be undefined after validatePatch2

            const valid = validatePatch2({
                discordToken: discordToken,
                discordTokenType: discordTokenType,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const discordUser = await getDiscordUser(res, discordTokenType, discordToken);

            if (!discordUser) return;
            else if (isErrorWithMessage(discordUser)) throw discordUser;

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


            const formattedUser = formatFullUser(updatedUser);

            if (isErrorWithMessage(formattedUser)) throw formattedUser;

            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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
            next(toErrorWithMessage(error));
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
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




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
            next(toErrorWithMessage(error));
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
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/:userID/permissions")
    .get(async function (req, res, next) {
        try {
            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } });    //can cast as "users" because the router.param already checked that the id is valid

            res.status(200).json(userFromId.permissions);
        }
        catch (error) {
            next(toErrorWithMessage(error));
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
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);





export { router as usersRouter };
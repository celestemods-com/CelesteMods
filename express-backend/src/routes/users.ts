import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { formatPartialUser, formatFullUser } from "../helperFunctions/users";
import { getDiscordUserFromCode } from "../helperFunctions/discord";
import { storeIdentityInSession, adminPermsArray, checkPermissions, checkSessionAge } from "../helperFunctions/sessions";

import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { users } from ".prisma/client";
import { formattedUser, permissions } from "../types/frontend";
import { connectMapsData, createUserData, updateUserData } from "../types/internal";


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
                    users_to_maps: true,
                    publishers: true,
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
            const discordCode: string = req.body.code;         //can't be null after validatePost call
            const displayName: string = req.body.displayName;           //can't be null after validatePost call
            const displayDiscord: boolean = req.body.displayDiscord;    //can't be null after validatePost call
            const showCompletedMaps: boolean = req.body.showCompletedMaps;  //can't be null after validatePost call
            const completedMapIDsArray: number[] | undefined = req.body.completedMapIDs;
            const gamebananaIDsArray: number[] | undefined = req.body.gamebananaIDs;
            const generateSessionBool: boolean | undefined = req.body.generateSessionBool;


            const valid = validatePost({
                discordCode: discordCode, //comment out for testing
                displayName: displayName,
                displayDiscord: displayDiscord,
                showCompletedMaps: showCompletedMaps,
                completedMapIDs: completedMapIDsArray,
                gamebananaIDs: gamebananaIDsArray,
                generateSessionBool: generateSessionBool,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            let napsConnectArray: connectMapsData[] = [];
            if (completedMapIDsArray && completedMapIDsArray.length) {
                let invalidMapIDs: number[] = [];

    
                napsConnectArray = await Promise.all(
                    completedMapIDsArray.map(
                        async (mapID) => {
                            const matchingMap = await prisma.maps_ids.findUnique({ where: { id: mapID } });

                            if (!matchingMap) invalidMapIDs.push(mapID);

                            
                            return {
                                maps_ids: {
                                    connect: {
                                        id: mapID,
                                    }
                                },
                            };
                        }
                    )
                )


                if (invalidMapIDs.length) {
                    res.status(400).json(`Invalid map ID(s): ${invalidMapIDs.join(", ")}`);
                    return;
                }
            }


            const discordUser = await getDiscordUserFromCode(res, discordCode);

            if (!discordUser) return;

            const discordID = discordUser.id;
            const discordUsername = discordUser.username;
            const discordDiscrim = discordUser.discriminator;


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
                showCompletedMaps: showCompletedMaps,
            }


            if (completedMapIDsArray && completedMapIDsArray.length) {
                createData.users_to_maps = { create: napsConnectArray };
            }


            if (gamebananaIDsArray && gamebananaIDsArray.length) {
                const createOrConnectArray: {}[] = gamebananaIDsArray.map((gamebananaID) => {
                    return { create: { gamebananaID: gamebananaID }, where: { gamebananaID: gamebananaID } };
                });

                createData.publishers = { connectOrCreate: createOrConnectArray };
            }


            const rawUser = await prisma.users.create({
                data: createData,
                include: {
                    users_to_maps: true,
                    publishers: true,
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
                    users_to_maps: true,
                    publishers: true,
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
                    users_to_maps: true,
                    publishers: true,
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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;



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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true);
            }


            const rawUser = await prisma.users.findUnique({
                where: { id: userID },
                include: {
                    users_to_maps: true,
                    publishers: true,
                },
            });
            if (!rawUser) throw "rawUser is null!";


            let formattedUser;

            if (permitted) {
                formattedUser = formatFullUser(rawUser);
            }
            else {
                formattedUser = formatPartialUser(rawUser);
            }

            if (isErrorWithMessage(formattedUser)) throw formattedUser;


            res.status(200).json(formattedUser);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .patch(async function (req, res, next) {
        try {
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const displayName: string | null = req.body.displayName === undefined ? null : req.body.displayName;
            const displayDiscord: boolean | null = req.body.displayDiscord === undefined ? null : req.body.displayDiscord;
            const showCompletedMaps: boolean | null = req.body.showCompletedMaps === undefined ? null : req.body.showCompletedMaps;

            const valid = validatePatch1({
                displayName: displayName,
                displayDiscord: displayDiscord,
                showCompletedMaps: showCompletedMaps,
            });

            if (!valid || (displayName === undefined && displayDiscord === undefined && showCompletedMaps === null)) {
                res.status(400).json("Malformed request body");
                return;
            }


            if (!req.valid) {
                res.status(403).json("Deleted or banned accounts cannot be updated");
                return;
            }


            const updateUserData: updateUserData = {};

            if (displayName !== null) updateUserData.displayName = displayName;

            if (displayDiscord !== null) updateUserData.displayDiscord = displayDiscord;

            if (showCompletedMaps !== null) updateUserData.showCompletedMaps = showCompletedMaps;


            const rawUser = await prisma.users.update({
                where: { id: req.id },
                data: updateUserData,
                include: {
                    users_to_maps: true,
                    publishers: true,
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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }

            if (!permitted) return;


            //for production
            const discordCode: string = req.body.code;         //can't be undefined after validatePatch2

            const valid = validatePatch2({
                discordCode: discordCode,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const discordUser = await getDiscordUserFromCode(res, discordCode);

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


            const userFromId = <users>await prisma.users.findUnique({ where: { id: userID } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.discordID != discordID && userFromId.discordID != null) {
                res.status(400).json("The discordID assigned to the specified user does not match the ID retrieved with the provided discordToken");
                return;
            }

            if (userFromId.accountStatus != "Active") {
                res.status(403).json("Deleted or banned accounts cannot be updated");
                return;
            }


            const updatedUser = await prisma.users.update({
                where: { id: userID },
                data: {
                    discordUsername: discordUsername,
                    discordDiscrim: discordDiscrim,
                },
                include: {
                    users_to_maps: true,
                    publishers: true,
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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const userFromId = <users>await prisma.users.findUnique({ where: { id: userID } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Banned") {
                res.status(403).json("Banned accounts cannot be deleted");
                return;
            }

            if (userFromId.accountStatus === "Deleted") {
                res.status(200).json(userFromId.timeDeletedOrBanned);
                return;
            }

            await prisma.users.update({
                where: { id: userID },
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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const userFromId = <users>await prisma.users.findUnique({ where: { id: userID } }); //can cast as "users" because the router.param already checked that the id is valid

            if (userFromId.accountStatus === "Banned") {
                res.status(403).json("Banned accounts cannot be deleted");
                return;
            }

            if (userFromId.accountStatus === "Active") {
                res.sendStatus(200);
                return;
            }

            await prisma.users.update({
                where: { id: userID },
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
            const permitted = await checkPermissions(req, adminPermsArray, true, res);
            if (!permitted) return;


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
            const permitted = await checkPermissions(req, adminPermsArray, true, res);
            if (!permitted) return;


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
            const userID = <number>req.id;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const userFromId = <users>await prisma.users.findUnique({ where: { id: req.id } });    //can cast as "users" because the router.param already checked that the id is valid

            res.status(200).json(userFromId.permissions.split(","));
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .patch(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, adminPermsArray, true, res);
            if (!permitted) return;


            const permissionsArray: permissions[] = req.body.permissions;


            const valid = validatePatch3({
                permissions: permissionsArray,
            });

            if (!valid || !permissionsArray) {
                res.status(400).json("Malformed request body");
                return;
            }


            let permissionsString = "";

            if (permissionsArray.length) permissionsString = permissionsArray.join(",");


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




router.param("mapID", async function (req, res, next) {
    const idRaw: unknown = req.params.mapID;

    const id = Number(idRaw);

    if (isNaN(id)) {
        res.status(400).json("mapID is not a number");
        return;
    }


    const mapFromID = await prisma.maps_ids.findUnique({ where: { id: id } });

    if (!mapFromID) {
        res.status(404).json("mapID does not exist");
        return;
    }


    const idsMatch = await prisma.users_to_maps.findUnique({
        where: {
            userID_mapID: {
                userID: <number>req.id,
                mapID: id,
            }
        }
    })


    req.id2 = id;
    req.idsMatch = idsMatch ? true : false;
    next();
});


router.route("/:userID/maps/:mapID")
    .post(async function (req, res, next) {
        try {
            const userID = <number>req.id;
            const mapID = <number>req.id2;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            if (!req.idsMatch) {
                await prisma.users_to_maps.create({
                    data: {
                        users: { connect: { id: userID } },
                        maps_ids: { connect: { id: mapID } },
                    }
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
            const userID = <number>req.id;
            const mapID = <number>req.id2;


            let permitted;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            if (req.idsMatch) {
                await prisma.users_to_maps.delete({
                    where: {
                        userID_mapID: {
                            userID: userID,
                            mapID: mapID,
                        }
                    }
                });
            }


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
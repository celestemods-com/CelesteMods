import express from "express";
import { prisma } from "../prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed, errorWithMessage } from "../errorHandling";
import {
    param_publisherID, getGamebananaUsernameById, formatPublisher, patchPublisherWithName, patchPublisherWithUserID,
    patchPublisherWithGamebananaID
} from "../helperFunctions/maps-mods-publishers";
import { param_userID } from "../helperFunctions/users";
import { mapStaffPermsArray, checkPermissions } from "../helperFunctions/sessions";

import { validatePublisherPost, validatePublisherPatch } from "../jsonSchemas/maps-mods-publishers";

import { publishers } from ".prisma/client";
import { rawPublisher } from "../types/internal";


const publishersRouter = express.Router();




publishersRouter.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawPublishers = await prisma.publishers.findMany({ include: { users: true } });

            const formattedPublishers = await Promise.all(
                rawPublishers.map(
                    async (rawPublisher) => {
                        const formattedPublisher = await formatPublisher(rawPublisher);

                        if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

                        return formattedPublisher;
                    }));

            res.json(formattedPublishers);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const gamebananaID: number | undefined = req.body.gamebananaID === null ? undefined : req.body.gamebananaID;
            const userID: number | undefined = req.body.userID === null ? undefined : req.body.userID;
            const name: string | undefined = userID || req.body.name === null ? undefined : req.body.name;


            let permitted = false;

            if (req.session.userID) {
                if (req.session && req.session.userID && req.session.userID === userID) {
                    permitted = true;
                }
                else {
                    permitted = await checkPermissions(req, mapStaffPermsArray, true);
                }
            }
            else {
                res.sendStatus(401);
                return;
            }

            if (!permitted) {
                res.sendStatus(403);
                return;
            }




            const valid = validatePublisherPost({
                gamebananaID: gamebananaID,
                userID: userID,
                name: name,
            });


            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawMatchingPublisher = await prisma.publishers.findFirst({
                where: {
                    OR: [
                        { gamebananaID: gamebananaID },     //TODO: test how prisma handles undefined == null and null == null
                        {
                            userID: userID,         //TODO: test how prisma handles undefined == null and null == null
                            name: name,
                        },
                    ],
                },
                include: { users: true },
            });

            if (rawMatchingPublisher) {
                const formattedMatchingPublisher = await formatPublisher(rawMatchingPublisher);

                if (isErrorWithMessage(formattedMatchingPublisher)) throw formattedMatchingPublisher;

                res.status(200).json(formattedMatchingPublisher);
                return;
            }


            let rawPublisher: rawPublisher;

            if (gamebananaID) {
                const gamebananaUsername = await getGamebananaUsernameById(gamebananaID);

                if (isErrorWithMessage(gamebananaUsername)) throw gamebananaUsername;

                rawPublisher = await prisma.publishers.create({
                    data: {
                        gamebananaID: gamebananaID,
                        name: gamebananaUsername,
                        users: { connect: { id: userID } },
                    },
                    include: { users: true },
                });
            }
            else if (userID) {
                const userFromID = await prisma.users.findUnique({ where: { id: userID } });

                if (!userFromID) {
                    res.status(404).json("userID does not exist");
                    return;
                }

                rawPublisher = await prisma.publishers.create({
                    data: {
                        name: userFromID.displayName,
                        users: { connect: { id: userID } },
                    },
                    include: { users: true },
                });
            }
            else {
                if (!name) throw "name is undefined";

                rawPublisher = await prisma.publishers.create({
                    data: { name: name },
                    include: { users: true },
                });
            }


            const formattedPublisher = await formatPublisher(rawPublisher);

            if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

            res.status(201).json(formattedPublisher);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.route("/search")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }

            const rawPublishers = await prisma.publishers.findMany({
                where: { name: { startsWith: query } },
                include: { users: true },
            });

            const formattedPublishers = await Promise.all(
                rawPublishers.map(
                    async (rawPublisher) => {
                        const formattedPublisher = await formatPublisher(rawPublisher);

                        if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

                        return formattedPublisher;
                    }));

            res.json(formattedPublishers);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/user/:userID")
    .get(async function (req, res, next) {
        try {
            const id = <number>req.id2; //.param has already checked that the id is valid

            const rawPublishers = await prisma.publishers.findMany({
                where: { userID: id },
                include: { users: true },
            });

            const formattedPublishers = await Promise.all(
                rawPublishers.map(
                    async (rawPublisher) => {
                        const formattedPublisher = await formatPublisher(rawPublisher);

                        if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

                        return formattedPublisher;
                    }));

            res.json(formattedPublishers);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("publisherID", async function (req, res, next) {
    try {
        await param_publisherID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/:publisherID")
    .get(async function (req, res, next) {
        try {
            const rawPublisher = <rawPublisher>req.publisher;


            const formattedPublisher = await formatPublisher(rawPublisher);

            if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

            res.json(formattedPublisher);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const id = <number>req.id   //.param already checked that the id is valid
            let gamebananaID: number | null | undefined = req.body.gamebananaID;
            let name: string | undefined = req.body.name === null ? undefined : req.body.name;
            let userID: number | null | undefined = req.body.userID;
            const publisherFromId = <publishers>req.publisher;


            let permitted = false;

            if (req.session.userID) {
                if (req.session.userID === publisherFromId.userID) {
                    permitted = true;
                }
                else {
                    permitted = await checkPermissions(req, mapStaffPermsArray, true);
                }
            }
            else {
                res.sendStatus(401);
                return;
            }

            if (!permitted) {
                res.sendStatus(403);
                return;
            }


            const valid = validatePublisherPatch({
                gamebananaID: gamebananaID,
                name: name,
                userID: userID,
            });

            if (!valid || (gamebananaID === undefined && !name && userID === undefined)) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawMatchingPublisher = await prisma.publishers.findFirst({
                where: {
                    AND: [
                        {
                            NOT: { id: id },
                        },
                        {
                            OR: [
                                {
                                    gamebananaID: gamebananaID
                                },
                                {
                                    userID: userID,                 //TODO: test how prisma handles undefined == null and null == null
                                    name: name,
                                },
                            ],
                        },
                    ],
                },
                include: { users: true },
            });

            if (rawMatchingPublisher) {
                const formattedPublisher = await formatPublisher(rawMatchingPublisher);

                if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

                res.status(400).json(rawMatchingPublisher);
                return;
            }


            let rawPublisher: rawPublisher | errorWithMessage;

            if (gamebananaID) {
                if (userID) {
                    permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
                    if (!permitted) return;
                }


                rawPublisher = await patchPublisherWithGamebananaID(id, gamebananaID, userID, publisherFromId);
            }
            else if (userID) {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
                if (!permitted) return;


                const userFromID = await prisma.users.findUnique({ where: { id: userID } });

                if (!userFromID) {
                    res.status(404).json("userID does not exist");
                    return;
                }

                rawPublisher = await patchPublisherWithUserID(userFromID, id, publisherFromId);
            }
            else {
                if (!name) throw "name is undefined";

                if (publisherFromId.gamebananaID) {
                    res.status(400).json("The specified publisher has a gamebananaID specified, so the publisher name is determined by the associated gamebanana username");
                    return;
                }

                if (publisherFromId.userID) {
                    res.status(400).json("The specified publisher is linked to a celestemods.com userID, so the publisher name is determined by the user's displayName");
                    return;
                }

                rawPublisher = await patchPublisherWithName(id, name);
            }


            if (isErrorWithMessage(rawPublisher)) throw rawPublisher;

            const formattedPublisher = await formatPublisher(rawPublisher);

            if (isErrorWithMessage(formattedPublisher)) throw formattedPublisher;

            res.status(200).json(formattedPublisher);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const id = <number>req.id;  //id has already been validated by .param

            await prisma.publishers.delete({ where: { id: id } });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.use(noRouteError);

publishersRouter.use(errorHandler);




export { publishersRouter };
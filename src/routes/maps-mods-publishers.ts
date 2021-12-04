import express, { NextFunction, Response } from "express";
import axios from "axios";
import prismaNamespace from "@prisma/client";
import { prisma } from "../prismaClient";
import { validateMapPostToMod, validateMapPatch, validateMapPut, validateModPost, validateModPatch, validatePublisherPatch } from "../jsonSchemas/maps-mods-publishers";
import { errorWithMessage, isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { expressRoute } from "../types/express";
import { mods, maps, publishers, difficulties, mods_type, users } from ".prisma/client";
import { rawMod, rawMap, rawPublisher, createMSubmissionData, createParentDifficultyForMod, createChildDifficultyForMod } from "../types/internal";
import { formattedMod, formattedMap, formattedPublisher } from "../types/frontend";


const modsRouter = express.Router();
const mapsRouter = express.Router();
const publishersRouter = express.Router();
const submissionsRouter = express.Router();




modsRouter.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawMods = await prisma.mods.findMany({
                include: {
                    publishers: true,
                    difficulties: true,
                    maps: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMods = rawMods.map((rawmod) => {
                const formattedMod = formatMod(rawmod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const submitterUser: users = {        //comment out for production
                id: 5,
                displayName: "steve",
                discordID: "5",
                discordUsername: "steve",
                discordDiscrim: "5555",
                displayDiscord: false,
                timeCreated: 1,
                permissions: "",
                accountStatus: "Active",
                timeDeletedOrBanned: null,
            };

            const type: mods_type = req.body.type;
            const name: string = req.body.name;
            const publisherName: string | undefined = req.body.publisherName;
            const publisherID: number | undefined = req.body.publisherID;
            const publisherGamebananaID: number | undefined = req.body.publisherGamebananaID;
            const userID: number | undefined = req.body.userID;
            const contentWarning: boolean = req.body.contentWarning;
            const notes: string | undefined = req.body.notes;
            const shortDescription: string = req.body.shortDescription;
            const longDescription: string | undefined = req.body.longDescription;
            const gamebananaModID: number = req.body.gamebananaModID;
            const difficultyNames: (string | string[])[] | undefined = req.body.difficulties;
            const maps: maps[] = req.body.maps;

            const valid = validateModPost({
                type: type,
                name: name,
                publisherName: publisherName,
                publisherID: publisherID,
                publisherGamebananaID: publisherGamebananaID,
                userID: userID,
                contentWarning: contentWarning,
                notes: notes,
                shortDescription: shortDescription,
                longDescription: longDescription,
                gamebananaModID: gamebananaModID,
                difficultyNames: difficultyNames,
                maps: maps,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawMatchingMod = await prisma.mods.findFirst({
                where: { gamebananaModID: gamebananaModID },
                include: {
                    publishers: true,
                    difficulties: true,
                    maps: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });

            if (rawMatchingMod) {
                const formattedMatchingMod = formatMod(rawMatchingMod);

                if (isErrorWithMessage(formattedMatchingMod)) throw formattedMatchingMod;

                res.status(200).json(formattedMatchingMod);
            }


            const publisherConnectionObject = await getPublisherConnectionObject(res, userID, publisherGamebananaID, publisherID, publisherName);

            if (!publisherConnectionObject || isErrorWithMessage(publisherConnectionObject)) {
                throw `publisherConnectionObject = "${publisherConnectionObject}"`;
            }


            const creationMSubmissionObject = await getCreationMSubmissionObject(submitterUser);

            if (isErrorWithMessage(creationMSubmissionObject)) throw creationMSubmissionObject;
            

            let diffiucultiesCreationArray: createParentDifficultyForMod[] | errorWithMessage = [];

            if (difficultyNames) {
                diffiucultiesCreationArray = await getDifficultiesCreationArray(difficultyNames);

                if (isErrorWithMessage(diffiucultiesCreationArray)) throw diffiucultiesCreationArray;
            }


            const rawMod = await prisma.mods.create({
                data: {
                    type: type,
                    name: name,
                    publishers: publisherConnectionObject,
                    contentWarning: contentWarning,
                    notes: notes,
                    shortDescription: shortDescription,
                    longDescription: longDescription,
                    gamebananaModID: gamebananaModID,
                    difficulties: { create: diffiucultiesCreationArray },
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: { create: creationMSubmissionObject },
                },
                include: {
                    publishers: true,
                    maps: true,
                    difficulties: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMod = formatMod(rawMod);

            if (isErrorWithMessage(formattedMod)) throw formattedMod;

            res.status(201).json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.param("gbModID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.gbModID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("gamebananaModID is not a number");
            return;
        }

        const modFromID = await prisma.mods.findUnique({
            where: { gamebananaModID: id },
            include: {
                publishers: true,
                maps: true,
                difficulties: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
            },
        });

        if (!modFromID) {
            res.status(404).json("gamebananaModID does not exist");
            return;
        }

        req.mod = modFromID;
        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


modsRouter.route("/gamebanana/:gbModID")
    .get(async function (req, res, next) {
        try {
            const rawMod = req.mod;

            if (!rawMod) throw "rawMod = null or undefined";

            const formattedMod = formatMod(rawMod);

            if (isErrorWithMessage(formattedMod)) throw formattedMod;

            res.json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.route("/search")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMods = await prisma.mods.findMany({
                where: { name: { startsWith: query } },
                include: {
                    publishers: true,
                    maps: true,
                    difficulties: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMods: formattedMod[] = rawMods.map((rawMod) => {
                const formattedMod = formatMod(rawMod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })




modsRouter.route("/type")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (query !== "Normal" && query !== "Collab" && query !== "Contest" && query !== "Lobby") {
                res.sendStatus(400);
                return;
            }


            const rawMods = await prisma.mods.findMany({
                where: { type: query },
                include: {
                    publishers: true,
                    maps: true,
                    difficulties: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMods: formattedMod[] = rawMods.map((rawMod) => {
                const formattedMod = formatMod(rawMod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.param("publisherID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.publisherID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("publisherID is not a number");
            return;
        }

        const modsFromID = await prisma.mods.findMany({
            where: { publisherID: id },
            include: {
                publishers: true,
                maps: true,
                difficulties: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
            },
        });

        if (!modsFromID || !modsFromID.length) {
            res.status(404).json("publisherID does not exist");
            return;
        }

        req.mods = modsFromID;
        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


modsRouter.param("gbUserID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.gbUserID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("gamebananaUserID is not a number");
            return;
        }

        const modsFromID = await prisma.mods.findMany({
            where: { publishers: { gamebananaID: id} },
            include: {
                publishers: true,
                maps: true,
                difficulties: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
            },
        });

        if (!modsFromID || !modsFromID.length) {
            res.status(404).json("gamebananaUserID does not exist");
            return;
        }

        req.mods = modsFromID;
        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


modsRouter.route("/publisher/gamebanana/:gbUserID")
    .get(async function (req, res, next) {
        try {
            const rawMods = <rawMod[]>req.mods;     //can cast as rawMod[] because the router.param already checked that the array isnt empty


            const formattedMods = rawMods.map((rawmod) => {
                const formattedMod = formatMod(rawmod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


modsRouter.route("/publisher/:publisherID")
    .get(async function (req, res, next) {
        try {
            const rawMods = <rawMod[]>req.mods;     //can cast as rawMod[] because the router.param already checked that the array isnt empty


            const formattedMods = rawMods.map((rawmod) => {
                const formattedMod = formatMod(rawmod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


modsRouter.route("/user/:userID/publisher")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;     //can cast as number because the router.param already checked that the id is valid


            const rawMods =  await prisma.mods.findMany({
                where: { publishers: { userID: userID} },
                include: {
                    publishers: true,
                    maps: true,
                    difficulties: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMods = rawMods.map((rawmod) => {
                const formattedMod = formatMod(rawmod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


modsRouter.route("/user/:userID/submitter")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;     //can cast as number because the router.param already checked that the id is valid


            const rawMods =  await prisma.mods.findMany({
                where: {
                    OR: [
                        { map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: { submittedBy: userID } },
                        { map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: { submittedBy: userID } },
                    ]
                },
                include: {
                    publishers: true,
                    maps: true,
                    difficulties: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                    map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
                },
            });


            const formattedMods = rawMods.map((rawmod) => {
                const formattedMod = formatMod(rawmod);
                if (isErrorWithMessage(formattedMod)) throw formattedMod;
                return formattedMod;
            });


            res.json(formattedMods);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.param("modID", async function (req, res, next) {
    try {
        await param_modID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


modsRouter.route("/:modID")
    .get(async function (req, res, next) {
        try {
            const rawMod = <rawMod>req.mod    //can cast as rawMod because the router.param already checked that the id is valid

            const formattedMod = formatMod(rawMod);

            if (isErrorWithMessage(formattedMod)) throw formattedMod;

            res.json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.use(noRouteError);

modsRouter.use(errorHandler);




const getPublisherConnectionObject = async function (res: Response, userID?: number, publisherGamebananaID?: number, publisherID?: number, publisherName?: string): Promise<{} | void | errorWithMessage> {
    try {
        let publisherConnectionObject = {};


        if (userID) {
            const userFromID = await prisma.users.findUnique({
                where: { id: userID },
                include: { publishers: true },
            });

            if (!userFromID) {
                res.status(404).json("userID not found");
                return;
            }

            if (userFromID.publishers.length < 1) {
                res.status(400).json("Specified user has no associated publishers.");
                return;
            }

            if (userFromID.publishers.length > 1) {
                const publisherIDArray: number[] = []
                userFromID.publishers.map((publisher) => {
                    return publisher.id;
                });

                res.status(400).json("Specified user has more than 1 associated publisher. Please specify publisherID instead.\nPublisher IDs associated with the specified user are: " + publisherIDArray);
                return;
            }

            publisherConnectionObject = { connect: { id: userFromID.publishers[0].id } };
        }
        else if (publisherGamebananaID) {
            const publisherFromGbID = await prisma.publishers.findUnique({ where: { gamebananaID: publisherGamebananaID } });

            if (publisherFromGbID) {
                publisherConnectionObject = { connect: { id: publisherGamebananaID } };
            }
            else {
                const nameFromGamebanana = await getGamebananaUsernameById(publisherGamebananaID);

                if (isErrorWithMessage(nameFromGamebanana)) throw nameFromGamebanana;

                if (nameFromGamebanana == "false") {
                    res.status(404).json("Specified Member ID does not exist on GameBanana.");
                    return;
                }

                publisherConnectionObject = {
                    create: {
                        name: nameFromGamebanana,
                        gamebananaID: publisherGamebananaID,
                    },
                };
            }
        }
        else if (publisherID) {
            const publisherFromID = await prisma.publishers.findUnique({ where: { id: publisherID } });

            if (!publisherFromID) {
                res.status(404).json("publisherID not found.");
                return;
            }

            publisherConnectionObject = { connect: { id: publisherID } };
        }
        else if (publisherName) {
            const publishersFromName = await prisma.publishers.findMany({ where: { name: publisherName } });

            if (publishersFromName.length > 1) {
                const publisherIDArray: number[] = []
                publishersFromName.map((publisher) => {
                    return publisher.id;
                });

                res.status(400).json("More than one publisher has the specified name. Please specify publisherID instead.\nPublisher IDs with the specified name are: " + publisherIDArray);
                return;
            }

            if (publishersFromName.length === 1) {
                publisherConnectionObject = { connect: { id: publishersFromName[0].id } };
            }
            else {
                const gamebananaID = await getGamebananaIdByUsername(publisherName);

                if (isErrorWithMessage(gamebananaID)) throw gamebananaID;

                if (gamebananaID === -1) {
                    res.status(404).json("Specified username does not exist on GameBanana.");
                    return;
                }

                publisherConnectionObject = {
                    create: {
                        name: publisherName,
                        gamebananaID: gamebananaID,
                    },
                };
            }
        }
        else {
            throw "ajv somehow validated a POST without any way to define a publisher";
        }


        return publisherConnectionObject;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
};




const getCreationMSubmissionObject = async function (submitterUser: users) {
    try {
        const time = Math.floor(new Date().getTime() / 1000);
        const submitterID = submitterUser.id;
        const submitterPermissionsArray = submitterUser.permissions.split(",");
        let submitterHasPermission = false;
        const creationMSubmissionObject: createMSubmissionData = {
            timeSubmitted: time,
            users_map_and_mod_submissions_submittedByTousers: { connect: { id: submitterID } },
        };

        for (const permission of submitterPermissionsArray) {
            if (permission === "Map_Moderator" || permission === "Admin" || permission === "Super_Admin") {
                submitterHasPermission = true;
                break;
            }
        }

        if (submitterHasPermission) {
            creationMSubmissionObject.timeApproved = time;
            creationMSubmissionObject.users_map_and_mod_submissions_approvedByTousers = { connect: { id: submitterID } };
        }

        return creationMSubmissionObject;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
};




const getDifficultiesCreationArray = async function (difficultyNames: (string | string[])[]) {
    try {
        let diffiucultiesCreationArray: createParentDifficultyForMod[] = [];
        
        for (let parentDifficultyIndex = 0; parentDifficultyIndex < difficultyNames.length; parentDifficultyIndex++) {
            const parentDifficultyStringOrArray = difficultyNames[parentDifficultyIndex];

            if (typeof parentDifficultyStringOrArray === "string") {
                diffiucultiesCreationArray.push({
                    name: parentDifficultyStringOrArray,
                    order: parentDifficultyIndex + 1,
                });
                continue;
            }

            const childDifficultyArray: createChildDifficultyForMod[] = [];

            for (let childDifficultyIndex = 1; childDifficultyIndex < parentDifficultyStringOrArray.length; childDifficultyIndex++) {
                const childDifficultyName = parentDifficultyStringOrArray[childDifficultyIndex];

                childDifficultyArray.push({
                    name: childDifficultyName,
                    order: childDifficultyIndex,
                });
            }

            diffiucultiesCreationArray.push({
                name: parentDifficultyStringOrArray[0],
                order: parentDifficultyIndex + 1,
                other_difficulties: { create: childDifficultyArray },
            });
        }

        return diffiucultiesCreationArray;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




const formatMod = function (rawMod: rawMod) {
    try {
        const id = rawMod.id;
        const type = rawMod.type;
        const name = rawMod.name;
        const publisherID = rawMod.publisherID;
        const publisherGamebananaID = rawMod.publishers.gamebananaID === null ? undefined : rawMod.publishers.gamebananaID;
        const contentWarning = rawMod.contentWarning;
        const notes = rawMod.notes === null ? undefined : rawMod.notes;
        const shortDescription = rawMod.shortDescription;
        const longDescription = rawMod.longDescription === null ? undefined : rawMod.longDescription;
        const gamebananaModID = rawMod.gamebananaModID === null ? undefined : rawMod.gamebananaModID;
        const validated = rawMod.map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID.timeApproved === null ? false : true;
        const replacementModID = rawMod.replacementModID === null ? undefined : rawMod.replacementModID;
        const replaced = rawMod.map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID?.timeApproved === null ? undefined : replacementModID;


        const formattedMod: formattedMod = {
            id: id,
            type: type,
            name: name,
            publisherID: publisherID,
            publisherGamebananaID: publisherGamebananaID,
            contentWarning: contentWarning,
            notes: notes,
            shortDescription: shortDescription,
            longDescription: longDescription,
            gamebananaModID: gamebananaModID,
            maps: rawMod.maps,
            validated: validated,
            replaced: replaced,
        };

        if (rawMod.difficulties) {
            const parentDifficultyArray: difficulties[] = [];
            const subDifficultiesArray: difficulties[][] = [];

            for (const difficulty of rawMod.difficulties) {     //iterate through all difficulties
                const parentDifficultyID = difficulty.parentDifficultyID;

                if (parentDifficultyID === null) {      //parent difficulties are added to parentDifficultyArray
                    parentDifficultyArray.push(difficulty);
                    continue;
                }


                let alreadyListed = false;      //sub-difficulties are added to an array of their siblings, which is an element of subDifficultiesArray

                for (const siblingArray of subDifficultiesArray) {
                    if (siblingArray[0].parentDifficultyID === parentDifficultyID) {
                        siblingArray.push(difficulty);
                        alreadyListed = true;
                        break;
                    }
                }

                if (!alreadyListed) {
                    subDifficultiesArray.push([difficulty]);
                }
            }


            const formattedArray: (string | string[])[] = [];   //the array that will be added to formattedMod

            for (let parentOrder = 1; parentOrder <= parentDifficultyArray.length; parentOrder++) {   //iterate through all parent difficulties
                let parentId = NaN;
                let parentName = "";
                let hasChildren = false;

                for (const difficulty of parentDifficultyArray) {   //find the parent difficulty that matches the current value of parentOrder
                    if (difficulty.order === parentOrder) {
                        parentId = difficulty.id;
                        parentName = difficulty.name;
                        break;
                    }
                }

                for (const siblingArray of subDifficultiesArray) {      //check any of the sibling arrays contain children of the current parent difficulty
                    if (siblingArray[0].parentDifficultyID === id) {
                        const parentAndChildrenArray = [parentName];    //the parent does have children, so create an array with the parent's name as element 0

                        for (let siblingOrder = 1; siblingOrder <= siblingArray.length; siblingOrder++) {   //iterate through the parent's children
                            for (const sibling of siblingArray) {       //find the sibling difficulty that matches the current value of siblingOrder
                                if (sibling.order === siblingOrder) {
                                    parentAndChildrenArray.push(sibling.name);  //add the matching sibling's name to the array
                                    break;
                                }
                            }
                        }

                        formattedArray.push(parentAndChildrenArray);    //push the finished array to formattedArray
                        hasChildren = true;
                        break;
                    }
                }

                if (!hasChildren) {     //the parent does not have children, so add it to formattedArray as a string
                    formattedArray.push(parentName);
                }
            }


            formattedArray.forEach((parentDifficulty) => {      //check that all orders are continuous
                if (parentDifficulty === "") {
                    throw `Parent difficulty orders for mod ${id} are not continuous`;
                }

                if (parentDifficulty instanceof Array) {
                    parentDifficulty.forEach((childDifficulty) => {
                        if (childDifficulty === "") {
                            throw `Child difficulty orders for parent difficulty ${parentDifficulty[0]} in mod ${id} are not continuous`;
                        }
                    });
                }
            });


            formattedMod.difficulties = formattedArray;
        }


        return formattedMod;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
};










mapsRouter.route("/")
    .get(async function (_req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/search")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/search/mapper")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/search/tech")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/search/tech/any")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/search/tech/fc")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.param("lengthID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


mapsRouter.param("lengthOrder", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


mapsRouter.route("/length/order/:lengthOrder")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/length/:lengthID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


mapsRouter.route("/user/:userID/mapper")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/user/:userID/submitter")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.param("mapID", async function (req, res, next) {
    try {
        await param_mapID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


mapsRouter.route("/:mapID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .put(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.use(noRouteError);

mapsRouter.use(errorHandler);




const formatMaps = async function (rawMap: unknown) {
    
}










publishersRouter.route("/")
    .get(async function (_req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.route("/search")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/user/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("publisherID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/:publisherID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.use(noRouteError);

publishersRouter.use(errorHandler);










submissionsRouter.route("/")
    .get(async function (_req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




submissionsRouter.param("modID", async function (req, res, next) {
    try {
        await param_modID;
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


submissionsRouter.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




submissionsRouter.param("mapID", async function (req, res, next) {
    try {
        await param_mapID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


submissionsRouter.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




submissionsRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
        if (!res.status) next();
    }
    catch (error) {
        next(error);
    }
});


submissionsRouter.route("/submitter/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


submissionsRouter.route("/approver/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




submissionsRouter.param("submissionID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


submissionsRouter.route("/:submissionID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


submissionsRouter.route("/:submissionID/accept")
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


submissionsRouter.route("/:submissionID/reject")
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




submissionsRouter.use(noRouteError);

submissionsRouter.use(errorHandler);










const param_userID = <expressRoute>async function (req, res, next) {
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


const param_modID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.modID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("modID is not a number");
            return;
        }

        const modFromID = await prisma.mods.findUnique({
            where: { id: id },
            include: {
                publishers: true,
                maps: true,
                difficulties: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: true,
                map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: true,
            },
        });

        if (!modFromID) {
            res.status(404).json("modID does not exist");
            return;
        }

        req.mod = modFromID;
        req.id = id;
        next();
    }
    catch (error) {
        next(error);
    }
}


const param_mapID = <expressRoute>async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
}










const getGamebananaUsernameById = async function (gamebananaID: number) {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Member/IdentifyById?userid=${gamebananaID}`
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            const error = new Error("GameBanana api not responding as expected.");
            throw error;
        }

        const gamebananaName = String(axiosResponse.data[0]);

        return gamebananaName;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




const getGamebananaIdByUsername = async function (gamebananaUsername: string) {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Member/Identify?username=${gamebananaUsername}`
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            const error = new Error("GameBanana api not responding as expected.");
            throw error;
        }

        let gamebananaID = Number(axiosResponse.data[0]);

        if (isNaN(gamebananaID)) {
            gamebananaID = -1;
        }

        return gamebananaID;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}


export { modsRouter, mapsRouter, publishersRouter, submissionsRouter as mSubmissionsRouter };
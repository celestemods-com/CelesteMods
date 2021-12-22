import express, { NextFunction, Response } from "express";
import { prisma } from "../prismaClient";
import { validateMapPost, validateMapPatch, validateMapPut, validateModPost, validateModPatch, validatePublisherPatch } from "../jsonSchemas/maps-mods-publishers";
import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mods_details, mods_details_type, publishers } from ".prisma/client";
import {
    rawMod, rawMap, rawPublisher, createParentDifficultyForMod, createChildDifficultyForMod, jsonCreateMapWithMod,
    mapIdCreationObject, mapDetailsCreationObject, mapToTechCreationObject, defaultDifficultyForMod, submitterUser
} from "../types/internal";
import { formattedMod, formattedMap, formattedPublisher } from "../types/frontend";
import { formatMod, getPublisherConnectionObject, getDifficultyArrays, getMapIDsCreationArray, param_userID, param_modID,
    param_mapID, formatMap } from "../helperFunctions/maps-mods-publishers";


const modsRouter = express.Router();
const mapsRouter = express.Router();
const publishersRouter = express.Router();
const submissionsRouter = express.Router();




interface difficultyNamesArrayElement {
    id?: number,
    name: string,
}




//comment out for production
const submittingUser: submitterUser = {
    id: 5,
    displayName: "steve",
    discordID: "5",
    discordUsername: "steve",
    discordDiscrim: "5555",
    displayDiscord: false,
    timeCreated: 1,
    permissions: "",
    permissionsArray: [],
    accountStatus: "Active",
    timeDeletedOrBanned: null,
};




modsRouter.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawMods = await prisma.mods_ids.findMany({
                where: { mods_details: { some: { NOT: { timeApproved: null } } } },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
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
            const modType: mods_details_type = req.body.type;
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
            const maps: jsonCreateMapWithMod[] = req.body.maps;
            const currentTime = Math.floor(new Date().getTime() / 1000);


            const valid = validateModPost({
                type: modType,
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


            const publisherConnectionObject = await getPublisherConnectionObject(res, userID, publisherGamebananaID, publisherID, publisherName);

            if (res.errorSent) return;

            if (!publisherConnectionObject || isErrorWithMessage(publisherConnectionObject)) {
                throw `publisherConnectionObject = "${publisherConnectionObject}"`;
            }


            let difficultyNamesArray: difficultyNamesArrayElement[] = [];
            let difficultiesCreationArray: createParentDifficultyForMod[] = [];
            let defaultDifficultyObjectsArray: defaultDifficultyForMod[] = [];
            let modHasSubDifficultiesBool = true;
            let modUsesCustomDifficultiesBool = true;

            if (difficultyNames) {
                const difficultyArrays = getDifficultyArrays(difficultyNames);

                if (isErrorWithMessage(difficultyArrays)) throw difficultyArrays;

                difficultyNamesArray = <difficultyNamesArrayElement[]>difficultyArrays[0];
                difficultiesCreationArray = <createParentDifficultyForMod[]>difficultyArrays[1];
                modHasSubDifficultiesBool = <boolean>difficultyArrays[2];

                modUsesCustomDifficultiesBool = true;
            }
            else {
                defaultDifficultyObjectsArray = await prisma.difficulties.findMany({
                    where: { parentModID: null },
                    include: { other_difficulties: true },
                });

                if (!defaultDifficultyObjectsArray.length) throw "there are no default difficulties";
            }


            const lengthObjectArray = await prisma.map_lengths.findMany();

            const mapsIDsCreationArray = await getMapIDsCreationArray(res, maps, currentTime, modType, lengthObjectArray,
                difficultiesCreationArray, defaultDifficultyObjectsArray, modUsesCustomDifficultiesBool, modHasSubDifficultiesBool);

            if (res.errorSent) return;


            const rawModAndStatus = await prisma.$transaction(async () => {
                const rawMatchingMod = await prisma.mods_ids.findFirst({
                    where: { mods_details: { some: { gamebananaModID: gamebananaModID } } },
                    include: {
                        difficulties: true,
                        mods_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: { publishers: true },
                        },
                        maps_ids: {
                            where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                            include: {
                                maps_details: {
                                    where: { NOT: { timeApproved: null } },
                                    orderBy: { revision: "desc" },
                                    take: 1,
                                    include: {
                                        map_lengths: true,
                                        difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                        difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                        users_maps_details_mapperUserIDTousers: true,
                                        maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                if (rawMatchingMod) {
                    return [rawMatchingMod, 200];
                }


                const rawMod = await prisma.mods_ids.create({
                    data: {
                        difficulties: { create: difficultiesCreationArray },
                        mods_details: {
                            create: [{
                                type: modType,
                                name: name,
                                publishers: publisherConnectionObject,
                                contentWarning: contentWarning,
                                notes: notes,
                                shortDescription: shortDescription,
                                longDescription: longDescription,
                                gamebananaModID: gamebananaModID,
                                timeSubmitted: currentTime,
                                users_mods_details_submittedByTousers: { connect: { id: submittingUser.id } },
                            }],
                        },
                        maps_ids: { create: mapsIDsCreationArray},
                    },
                    include: {
                        difficulties: true,
                        mods_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: { publishers: true },
                        },
                        maps_ids: {
                            where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                            include: {
                                maps_details: {
                                    where: { NOT: { timeApproved: null } },
                                    orderBy: { revision: "desc" },
                                    take: 1,
                                    include: {
                                        map_lengths: true,
                                        difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                        difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                        users_maps_details_mapperUserIDTousers: true,
                                        maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                return [rawMod, 201];
            });


            if (modUsesCustomDifficultiesBool && modType !== "Normal") {
                //next task = implement connecting modDifficulty
                //modDifficulty has already been checked by a helper function before the transaction, but could not be connected in the transaction
                throw "not implemented yet";
            }


            const rawMod = <rawMod>rawModAndStatus[0];
            const status = <number>rawModAndStatus[1];

            const formattedMod = formatMod(rawMod);

            if (isErrorWithMessage(formattedMod)) throw formattedMod;

            res.status(status).json(formattedMod);
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

        const modFromID = await prisma.mods_ids.findFirst({
            where: {
                mods_details: {
                    some: {
                        NOT: { timeApproved: null },
                        gamebananaModID: id,
                    },
                },
            },
            include: {
                difficulties: true,
                mods_details: {
                    where: { NOT: { timeApproved: null } },
                    orderBy: { revision: "desc" },
                    take: 1,
                    include: { publishers: true },
                },
                maps_ids: {
                    where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                    include: {
                        maps_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                            },
                        },
                    },
                },
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


            const rawMods = await prisma.mods_ids.findMany({
                where: {
                    mods_details: {
                        some: {
                            NOT: { timeApproved: null },
                            name: { startsWith: query },
                        },
                    },
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
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


            const rawMods = await prisma.mods_ids.findMany({
                where: {
                    mods_details: {
                        some: {
                            NOT: { timeApproved: null },
                            type: query,
                        },
                    },
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
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

        const modsFromID = await prisma.mods_ids.findMany({
            where: {
                mods_details: {
                    some: {
                        NOT: { timeApproved: null },
                        publisherID: id,
                    },
                },
            },
            include: {
                difficulties: true,
                mods_details: {
                    where: { NOT: { timeApproved: null } },
                    orderBy: { revision: "desc" },
                    take: 1,
                    include: { publishers: true },
                },
                maps_ids: {
                    where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                    include: {
                        maps_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                            },
                        },
                    },
                },
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

        const modsFromID = await prisma.mods_ids.findMany({
            where: {
                mods_details: {
                    some: {
                        NOT: { timeApproved: null },
                        publishers: { gamebananaID: id },
                    },
                },
            },
            include: {
                difficulties: true,
                mods_details: {
                    where: { NOT: { timeApproved: null } },
                    orderBy: { revision: "desc" },
                    take: 1,
                    include: { publishers: true },
                },
                maps_ids: {
                    where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                    include: {
                        maps_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                            },
                        },
                    },
                },
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
    }
    catch (error) {
        next(error);
    }
});


modsRouter.route("/user/:userID/publisher")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;     //can cast as number because the router.param already checked that the id is valid


            const rawMods = await prisma.mods_ids.findMany({
                where: {
                    mods_details: {
                        some: {
                            NOT: { timeApproved: null },
                            publishers: { userID: userID },
                        },
                    },
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
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


            const rawMods = await prisma.mods_ids.findMany({
                where: {
                    mods_details: {
                        some: {
                            NOT: { timeApproved: null },
                            submittedBy: userID,
                        },
                    },
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
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
            const type: mods_details_type | undefined = req.body.type === null ? undefined : req.body.type;
            const name: string | undefined = req.body.name === null ? undefined : req.body.name;
            const publisherName: string | undefined = req.body.publisherName === null ? undefined : req.body.publisherName;
            const publisherID: number | undefined = req.body.publisherID === null ? undefined : req.body.publisherID;
            const publisherGamebananaID: number | undefined = req.body.publisherGamebananaID === null ? undefined : req.body.publisherGamebananaID;
            const userID: number | undefined = req.body.userID === null ? undefined : req.body.userID;
            const contentWarning: boolean | undefined = req.body.contentWarning === null ? undefined : req.body.contentWarning;
            const notes: string | undefined = req.body.notes === null ? undefined : req.body.notes;
            const shortDescription: string | undefined = req.body.shortDescription === null ? undefined : req.body.shortDescription;
            const longDescription: string | undefined = req.body.longDescription === null ? undefined : req.body.longDescription;
            const gamebananaModID: number | undefined = req.body.gamebananaModID === null ? undefined : req.body.gamebananaModID;
            const difficultyNames: string[] | undefined = req.body.difficultyNames === null ? undefined : req.body.difficultyNames;


            const valid = validateModPatch({
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
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawMatchingMod = await prisma.mods_ids.findFirst({
                where: {
                    NOT: { id: req.id },
                    mods_details: {
                        some: {
                            NOT: { timeApproved: null },    //should this be here? need to think about how this should work
                            gamebananaModID: gamebananaModID,
                        },
                    },
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (rawMatchingMod) {
                const formattedMatchingMod = formatMod(rawMatchingMod);

                if (isErrorWithMessage(formattedMatchingMod)) throw formattedMatchingMod;

                res.status(400).json(formattedMatchingMod);
            }


            const publisherConnectionObject = await getPublisherConnectionObject(res, userID, publisherGamebananaID, publisherID, publisherName);

            if (res.errorSent) return;

            if (!publisherConnectionObject || isErrorWithMessage(publisherConnectionObject)) {
                throw `publisherConnectionObject = "${publisherConnectionObject}"`;
            }


            let difficultyNamesArray: { name: string }[] = [];
            let difficultiesDataArray: createParentDifficultyForMod[] = [];
            let modHasSubDifficultiesBool = true;

            if (difficultyNames) {
                const difficultyArrays = getDifficultyArrays(difficultyNames);

                if (isErrorWithMessage(difficultyArrays)) throw difficultyArrays;

                difficultyNamesArray = <difficultyNamesArrayElement[]>difficultyArrays[0];
                difficultiesDataArray = <createParentDifficultyForMod[]>difficultyArrays[1];
                modHasSubDifficultiesBool = <boolean>difficultyArrays[2];
            }

            for (const parentDifficulty of difficultiesDataArray) {
                if (typeof (parentDifficulty) === "string") {

                }
            }

            // const test = await prisma.mods_ids.update({
            //     where: { id: req.id },
            //     data: {
            //         difficulties: {
            //             updateMany: {
            //                 where: {}
            //             }
            //         },
            //     },
            // });


            const rawMod = await prisma.mods_ids.update({
                where: { id: <number>req.id },  //can cast as number because the router.param already checked that the id was valid
                data: {
                    type: type,
                    name: name,
                    publishers: publisherConnectionObject,
                    contentWarning: contentWarning,
                    notes: notes,
                    shortDescription: shortDescription,
                    longDescription: longDescription,
                    gamebananaModID: gamebananaModID,
                },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: { publishers: true },
                    },
                    maps_ids: {
                        where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                        include: {
                            maps_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: {
                                    map_lengths: true,
                                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                    difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                    users_maps_details_mapperUserIDTousers: true,
                                    maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
                },
            });
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










mapsRouter.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawMaps = await prisma.maps_ids.findMany({
                where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                include: {
                    mods_ids: {
                        include: {
                            mods_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                            },
                        },
                    },
                    maps_details: {
                        where: { NOT: { timeApproved: null } },
                        orderBy: { revision: "desc" },
                        take: 1,
                        include: {
                            map_lengths: true,
                            difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                            difficulties_difficultiesTomaps_details_modDifficultyID: true,
                            users_maps_details_mapperUserIDTousers: true,
                            maps_to_tech_maps_detailsTomaps_to_tech_mapID: { include: { tech_list: true } },
                        },
                    },
                },
            });

            const formattedMaps = rawMaps.map((rawMap) => {
                const modType = rawMap.mods_ids.mods_details[0].type;
                const formattedMap = formatMap(rawMap, modType);
                if (isErrorWithMessage(formattedMap)) throw formattedMap;
                return formattedMap;
            });


            res.json(formattedMaps);
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
        await param_modID(req, res, next);
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










export { modsRouter, mapsRouter, publishersRouter, submissionsRouter as mSubmissionsRouter };
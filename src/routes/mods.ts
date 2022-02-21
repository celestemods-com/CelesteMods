import express from "express";
import { prisma } from "../prismaClient";
import { validateModPost, validateModPatch } from "../jsonSchemas/maps-mods-publishers";
import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mods_details_type } from ".prisma/client";
import {
    rawMod, createParentDifficultyForMod, difficultyNamesForModArrayElement, jsonCreateMapWithMod, defaultDifficultyForMod,
    modDetailsCreationObject, loneModDetailsCreationObject, submitterUser, publisherConnectionObject
} from "../types/internal";
import { formattedMod } from "../types/frontend";
import {
    formatMod, getPublisherConnectionObject, getDifficultyArrays, getMapIDsCreationArray, param_userID, param_modID,
    param_modRevision, privilegedUser
} from "../helperFunctions/maps-mods-publishers";
import { getCurrentTime } from "../helperFunctions/utils";
import { mapPost } from "./maps";


const modsRouter = express.Router();




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
                                    maps_to_tech: { include: { tech_list: true } },
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
            const currentTime = getCurrentTime();


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

            if (!valid || (difficultyNames && modType === "Normal")) {
                res.status(400).json("Malformed request body");
                return;
            }


            const publisherConnectionObject = await getPublisherConnectionObject(res, userID, publisherGamebananaID, publisherID, publisherName);

            if (res.errorSent) return;

            if (!publisherConnectionObject || isErrorWithMessage(publisherConnectionObject)) {
                throw `publisherConnectionObject = "${publisherConnectionObject}"`;
            }


            const rawModAndStatus = await prisma.$transaction(async () => {
                let difficultyNamesArray: difficultyNamesForModArrayElement[] = [];
                let difficultiesCreationArray: createParentDifficultyForMod[] = [];
                let defaultDifficultyObjectsArray: defaultDifficultyForMod[] = [];
                let modHasCustomDifficultiesBool = false;
                let modHasSubDifficultiesBool = true;


                if (difficultyNames) {
                    const difficultyWithHighestID = await prisma.difficulties.findMany({
                        orderBy: { id: "desc" },
                        take: 1,
                        select: { id: true },
                    });


                    const difficultyArrays = getDifficultyArrays(difficultyNames, difficultyWithHighestID[0].id);

                    if (isErrorWithMessage(difficultyArrays)) throw difficultyArrays;

                    difficultyNamesArray = <difficultyNamesForModArrayElement[]>difficultyArrays[0];
                    difficultiesCreationArray = <createParentDifficultyForMod[]>difficultyArrays[1];
                    modHasSubDifficultiesBool = <boolean>difficultyArrays[2];

                    modHasCustomDifficultiesBool = true;
                }
                else {
                    defaultDifficultyObjectsArray = await prisma.difficulties.findMany({
                        where: { parentModID: null },
                        include: { other_difficulties: true },
                    });

                    if (!defaultDifficultyObjectsArray.length) throw "there are no default difficulties";
                }


                const lengthObjectArray = await prisma.map_lengths.findMany();


                const mapsIDsCreationArray = await getMapIDsCreationArray(res, maps, 0, currentTime, modType, lengthObjectArray,
                    difficultiesCreationArray, defaultDifficultyObjectsArray, modHasCustomDifficultiesBool, modHasSubDifficultiesBool, submittingUser);

                if (res.errorSent) return;


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
                                        maps_to_tech: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                if (rawMatchingMod) {
                    return [rawMatchingMod, 200];
                }


                const modDetailsCreationObject: modDetailsCreationObject = {
                    revision: 1,
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
                }


                const privilegedUserBool = privilegedUser(submittingUser);

                if (privilegedUserBool) {
                    modDetailsCreationObject.timeApproved = currentTime;
                    modDetailsCreationObject.users_mods_details_approvedByTousers = { connect: { id: submittingUser.id } };
                }


                const rawMod = await prisma.mods_ids.create({
                    data: {
                        difficulties: { create: difficultiesCreationArray },
                        mods_details: {
                            create: [modDetailsCreationObject],
                        },
                        maps_ids: { create: mapsIDsCreationArray },
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
                                        maps_to_tech: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                return [rawMod, 201];
            });


            if (!rawModAndStatus) throw "no rawModAndStatus";


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
                                maps_to_tech: { include: { tech_list: true } },
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
                                    maps_to_tech: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
                },
            });


            const formattedMods: formattedMod[][] = rawMods.map((rawMod) => {
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
                                    maps_to_tech: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
                },
            });


            const formattedMods: formattedMod[][] = rawMods.map((rawMod) => {
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
                                maps_to_tech: { include: { tech_list: true } },
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
                                maps_to_tech: { include: { tech_list: true } },
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
                                    maps_to_tech: { include: { tech_list: true } },
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
                                    maps_to_tech: { include: { tech_list: true } },
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


modsRouter.param("modRevision", async function (req, res, next) {
    try {
        await param_modRevision(req, res, next);
    }
    catch (error) {
        next(error);
    }
});




modsRouter.route("/:modID/revisions")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const rawMods = await prisma.mods_ids.findMany({
                where: { id: modID },
                include: {
                    difficulties: true,
                    mods_details: {
                        orderBy: { revision: "desc" },
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
                                    maps_to_tech: { include: { tech_list: true } },
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


modsRouter.route("/:modID/revisions/:modRevision/accept")
    .post(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const revision = <number>req.revision;
            const time = getCurrentTime();

            const id_revision = {
                id: id,
                revision: revision,
            }


            const rawModOuter = await prisma.$transaction(async () => {
                await prisma.mods_details.update({
                    where: { id_revision: id_revision },
                    data: { timeApproved: time },
                });

                const rawModInner = <rawMod>await prisma.mods_ids.findFirst({
                    where: {
                        id: req.id,
                    },
                    include: {
                        difficulties: true,
                        mods_details: {
                            where: { revision: revision },
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
                                        maps_to_tech: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                return rawModInner;
            });


            const formattedMod = formatMod(rawModOuter);


            res.json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


modsRouter.route("/:modID/revisions/:modRevision/reject")
    .post(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const revision = <number>req.revision;

            const id_revision = {
                id: id,
                revision: revision,
            }


            await prisma.$transaction(async () => {
                await prisma.mods_details.delete({ where: { id_revision: id_revision } });

                const modFromID = await prisma.mods_ids.findUnique({
                    where: { id: id },
                    include: { mods_details: true },
                });

                if (!modFromID?.mods_details || !modFromID?.mods_details.length) {  //TODO: test whether an empty mods_ids has no mods_details property or an empty array
                    await prisma.mods_ids.delete({ where: { id: id } });
                }
            });


            res.status(204);
        }
        catch (error) {
            if (error === "RecordNotFound") {
                res.status(404).json("Specified mod does not have the specified revision");
            }
            else {
                next(error);
            }
        }
    })
    .all(methodNotAllowed);


modsRouter.route("/:modID/revisions/:modRevision")
    .get(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const revision = <number>req.revision;


            const rawMod = <rawMod>await prisma.mods_ids.findUnique({
                where: { id: id },
                include: {
                    difficulties: true,
                    mods_details: {
                        where: { revision: revision },
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
                                    maps_to_tech: { include: { tech_list: true } },
                                },
                            },
                        },
                    },
                },
            });


            const formattedMod = formatMod(rawMod);


            res.json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




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
            const id = <number>req.id;
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
            const currentTime = getCurrentTime();


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
                            NOT: { timeApproved: null },
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
                                    maps_to_tech: { include: { tech_list: true } },
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

                return;
            }


            const rawMod = await prisma.$transaction(async () => {
                const latestRevision = await prisma.mods_ids.findUnique({
                    where: { id: id },
                    include: {
                        mods_details: {
                            orderBy: { revision: "desc" },
                            take: 1,
                        },
                    },
                });

                if (!latestRevision?.mods_details || !latestRevision.mods_details.length) throw `Mod ${id} does not have any mod details!`;

                const newRevisionNumber = latestRevision?.mods_details[0].revision + 1;


                const latestValidRevision = await prisma.mods_ids.findUnique({
                    where: { id: id },
                    include: {
                        mods_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: { publishers: true },
                        }
                    }
                });


                const latestValidModDetails = latestValidRevision?.mods_details[0];

                if (!latestValidModDetails) throw "latestValidModDetails does not exist";


                let publisherConnectionObject: publisherConnectionObject = {};

                if (publisherGamebananaID || publisherID || publisherName || userID) {
                    const publisherConnectionReturnedObject = await getPublisherConnectionObject(res, userID, publisherGamebananaID, publisherID, publisherName);

                    if (res.errorSent) return;

                    if (!publisherConnectionReturnedObject || isErrorWithMessage(publisherConnectionReturnedObject)) {
                        throw `publisherConnectionObject = "${publisherConnectionReturnedObject}"`;
                    }

                    publisherConnectionObject = publisherConnectionReturnedObject;
                }
                else {
                    const publisherConnectionReturnedObject = await getPublisherConnectionObject(res, undefined, undefined,
                        latestValidRevision?.mods_details[0].publisherID, undefined);

                    if (res.errorSent) return;

                    if (!publisherConnectionReturnedObject || isErrorWithMessage(publisherConnectionReturnedObject)) {
                        throw `publisherConnectionObject = "${publisherConnectionReturnedObject}"`;
                    }

                    publisherConnectionObject = publisherConnectionReturnedObject;
                }


                const modDetailsCreationObject: loneModDetailsCreationObject = {
                    revision: newRevisionNumber,
                    type: !type ? latestValidModDetails.type : type,
                    name: !name ? latestValidModDetails.name : name,
                    publishers: publisherConnectionObject,
                    contentWarning: !contentWarning ? latestValidModDetails.contentWarning : contentWarning,
                    notes: notes === undefined ? latestValidModDetails.notes : notes,
                    shortDescription: !shortDescription ? latestValidModDetails.shortDescription : shortDescription,
                    longDescription: longDescription === undefined ? latestValidModDetails.longDescription : longDescription,
                    gamebananaModID: !gamebananaModID ? latestValidModDetails.gamebananaModID : gamebananaModID,
                    timeSubmitted: currentTime,
                    users_mods_details_submittedByTousers: { connect: { id: submittingUser.id } },
                    mods_ids: { connect: { id: id } },
                }


                await prisma.mods_details.create({ data: modDetailsCreationObject });


                const innerRawMod = <rawMod>await prisma.mods_ids.findUnique({
                    where: { id: id },
                    include: {
                        difficulties: true,
                        mods_details: {
                            where: { revision: newRevisionNumber },
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
                                        maps_to_tech: { include: { tech_list: true } },
                                    },
                                },
                            },
                        },
                    },
                });

                return innerRawMod;
            });


            if (res.errorSent) return;
            if (!rawMod) throw "no rawMod";


            const formattedMod = formatMod(rawMod);

            res.json(formattedMod);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const id = <number>req.id;

            await prisma.mods_ids.delete({ where: { id: id } });

            res.status(204);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            await mapPost(req, res, next);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




modsRouter.use(noRouteError);

modsRouter.use(errorHandler);


export { modsRouter };
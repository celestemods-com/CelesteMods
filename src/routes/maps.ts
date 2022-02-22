import express, { } from "express";
import { prisma } from "../prismaClient";
import { validateMapPost, validateMapPatch } from "../jsonSchemas/maps-mods-publishers";
import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mods_details_type, maps_details_side } from ".prisma/client";
import { rawMap, mapIdCreationObjectStandalone, mapToTechCreationObject, submitterUser, rawMod, mapDetailsCreationObjectStandalone } from "../types/internal";
import {
    param_userID, invalidMapperUserIdErrorMessage, param_mapID, formatMap, privilegedUser, param_lengthID, param_lengthOrder,
    param_mapRevision, getCanonicalDifficultyID, getLengthID, invalidMapDifficultyErrorMessage
} from "../helperFunctions/maps-mods-publishers";
import { getCurrentTime } from "../helperFunctions/utils";
import { expressRoute } from "../types/express";


const mapsRouter = express.Router();




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
                            maps_to_tech: { include: { tech_list: true } },
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
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            name: { startsWith: query },
                        },
                    }
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.route("/search/mapper")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            mapperNameString: { startsWith: query },
                        },
                    }
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.route("/search/tech")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            maps_to_tech: { some: { tech_list: { name: query } } },
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.route("/search/tech/any")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            maps_to_tech: {
                                some: {
                                    fullClearOnlyBool: false,
                                    tech_list: {
                                        name: query,
                                    },
                                },
                            },
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.route("/search/tech/fc")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            maps_to_tech: {
                                some: {
                                    fullClearOnlyBool: true,
                                    tech_list: {
                                        name: query,
                                    },
                                },
                            },
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.param("lengthID", async function (req, res, next) {
    try {
        await param_lengthID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


mapsRouter.param("lengthOrder", async function (req, res, next) {
    try {
        await param_lengthOrder(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


mapsRouter.route("/length/order/:lengthOrder")
    .get(async function (req, res, next) {
        try {
            const lengthID = <number>req.id2;


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            lengthID: lengthID,
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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


mapsRouter.route("/length/:lengthID")
    .get(async function (req, res, next) {
        try {
            const lengthID = <number>req.id2;


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            lengthID: lengthID,
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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
            const userID = <number>req.id2;


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            mapperUserID: userID,
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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


mapsRouter.route("/user/:userID/submitter")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            const rawMaps = await prisma.maps_ids.findMany({
                where: {
                    maps_details: {
                        some: {
                            NOT: { timeApproved: null },
                            submittedBy: userID,
                        },
                    },
                },
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
                            maps_to_tech: { include: { tech_list: true } },
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




mapsRouter.param("mapID", async function (req, res, next) {
    try {
        await param_mapID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


mapsRouter.param("mapRevision", async function (req, res, next) {
    try {
        await param_mapRevision(req, res, next);
    }
    catch (error) {
        next(error);
    }
});




mapsRouter.route("/:mapID/revisions")
    .get(async function (req, res, next) {
        try {
            const id = <number>req.id;


            const rawMap = <rawMap>await prisma.maps_ids.findUnique({
                where: { id: id },
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
                        orderBy: { revision: "desc" },
                        include: {
                            map_lengths: true,
                            difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                            difficulties_difficultiesTomaps_details_modDifficultyID: true,
                            users_maps_details_mapperUserIDTousers: true,
                            maps_to_tech: { include: { tech_list: true } },
                        },
                    },
                },
            });


            if (!rawMap.mods_ids) throw "mods_ids is undefined";
            const modType = rawMap?.mods_ids.mods_details[0].type;

            const formattedMap = formatMap(rawMap, modType);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision/accept")
    .post(async function (req, res, next) {
        try {
            const mapId = <number>req.id;
            const revision = <number>req.revision;
            const currentTime = getCurrentTime();
            const submitterId = submittingUser.id;


            const outerRawMap = await prisma.$transaction(async () => {
                await prisma.maps_details.update({
                    where: {
                        mapId_revision: {
                            mapId: mapId,
                            revision: revision,
                        },
                    },
                    data: {
                        timeApproved: currentTime,
                        approvedBy: submitterId,
                    },
                });

                const innerRawMap = <rawMap>await prisma.maps_ids.findUnique({
                    where: { id: mapId },
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
                            where: { revision: revision },
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech: { include: { tech_list: true } },
                            },
                        },
                    },
                });

                return innerRawMap;
            });


            if (!outerRawMap.mods_ids) throw "mods_ids is undefined";
            const modType = outerRawMap?.mods_ids.mods_details[0].type;

            const formattedMap = formatMap(outerRawMap, modType);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision/reject")
    .post(async function (req, res, next) {
        try {
            const mapId = <number>req.id;
            const revision = <number>req.revision;


            await prisma.maps_details.delete({
                where: {
                    mapId_revision: {
                        mapId: mapId,
                        revision: revision,
                    },
                },
            });


            const map = await prisma.maps_ids.findUnique({
                where: { id: mapId },
                include: { maps_details: { take: 1 } },
            });


            if (!map?.maps_details || !map.maps_details.length) {
                await prisma.maps_ids.delete({ where: { id: mapId } });
            }


            res.status(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision")
    .get(async function (req, res, next) {
        try {
            const mapId = <number>req.id;
            const revision = <number>req.revision;


            const rawMap = <rawMap>await prisma.maps_ids.findUnique({
                where: { id: mapId },
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
                        where: { revision: revision },
                        include: {
                            map_lengths: true,
                            difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                            difficulties_difficultiesTomaps_details_modDifficultyID: true,
                            users_maps_details_mapperUserIDTousers: true,
                            maps_to_tech: { include: { tech_list: true } },
                        },
                    },
                },
            });


            if (!rawMap.mods_ids) throw "mods_ids is undefined";
            const modType = rawMap?.mods_ids.mods_details[0].type;

            const formattedMap = formatMap(rawMap, modType);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.route("/:mapID")
    .get(async function (req, res, next) {
        try {
            const id = <number>req.id;


            const rawMap = <rawMap>await prisma.maps_ids.findUnique({
                where: { id: id },
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
                            maps_to_tech: { include: { tech_list: true } },
                        },
                    },
                },
            });


            if (!rawMap.mods_ids) throw "mods_ids is undefined";
            const modType = rawMap?.mods_ids.mods_details[0].type;

            const formattedMap = formatMap(rawMap, modType);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const mapID = <number>req.id;
            const mapFromID = <rawMap>req.map;
            const modID = mapFromID.modID;
            const modType = <mods_details_type>mapFromID.mods_ids?.mods_details[0].type;
            const name: string = !req.body.name ? mapFromID.maps_details[0].name : req.body.name;
            const canonicalDifficultyName: string | undefined = req.body.canonicalDifficulty === null ?
                undefined : req.body.canonicalDifficulty;
            const lengthName: string | undefined = req.body.length;
            const description: string | null = req.body.description === undefined ? mapFromID.maps_details[0].description : req.body.description;
            const notes: string | null = req.body.notes === undefined ? mapFromID.maps_details[0].notes : req.body.notes;
            const mapperUserID: number | null = req.body.mapperUserID === undefined ? mapFromID.maps_details[0].mapperUserID : req.body.mapperUserID;
            const mapperNameString: string = !req.body.mapperNameString ? mapFromID.maps_details[0].mapperNameString : req.body.mapperNameString;
            const chapter: number | null = !req.body.chapter ? mapFromID.maps_details[0].chapter : req.body.chapter;
            const side: maps_details_side | null = !req.body.side ? mapFromID.maps_details[0].side : req.body.side;
            const modDifficulty: string | string[] | undefined = req.body.modDifficulty === null ? undefined : req.body.modDifficulty;
            const overallRank: number | null = !req.body.overallRank ? mapFromID.maps_details[0].overallRank : req.body.overallRank;
            const mapRemovedFromModBool: boolean = !req.body.mapRemovedFromModBool ? mapFromID.maps_details[0].mapRemovedFromModBool : req.body.mapRemovedFromModBool;
            const techAny: string[] | undefined = req.body.techAny === null ? undefined : req.body.techAny;
            const techFC: string[] | undefined = req.body.techFC === null ? undefined : req.body.techFC;
            const currentTime = getCurrentTime();


            const valid = validateMapPatch({
                name: name,
                canonicalDifficulty: canonicalDifficultyName,
                length: lengthName,
                description: description,
                notes: notes,
                mapperUserID: mapperUserID,
                mapperNameString: mapperNameString,
                chapter: chapter,
                side: side,
                modDifficulty: modDifficulty,
                overallRank: overallRank,
                mapRemovedFromModBool: mapRemovedFromModBool,
                techAny: techAny,
                techFC: techFC,
            });

            if (!valid || (modDifficulty && modType === "Normal")) {
                res.status(400).json("Malformed request body");
                return;
            }

            const outerRawMap = await prisma.$transaction(async () => {
                let canonicalDifficultyID: number;
                if (canonicalDifficultyName === undefined) {
                    canonicalDifficultyID = mapFromID.maps_details[0].canonicalDifficultyID;
                }
                else {
                    canonicalDifficultyID = await getCanonicalDifficultyID(canonicalDifficultyName, techAny);
                }


                let lengthID: number;
                if (lengthName) {
                    lengthID = await getLengthID(lengthName);
                }
                else {
                    lengthID = mapFromID.maps_details[0].lengthID;
                }


                const mapDetailsCreationObject: mapDetailsCreationObjectStandalone = {
                    maps_ids: { connect: { id: mapID } },
                    name: name,
                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: { connect: { id: canonicalDifficultyID } },
                    map_lengths: { connect: { id: lengthID } },
                    description: description,
                    notes: notes,
                    mapRemovedFromModBool: mapRemovedFromModBool,
                    timeSubmitted: currentTime,
                    users_maps_details_submittedByTousers: { connect: { id: submittingUser.id } },
                };


                const privilegedUserBool = privilegedUser(submittingUser);

                if (isErrorWithMessage(privilegedUserBool)) throw privilegedUserBool;

                if (privilegedUserBool) {
                    mapDetailsCreationObject.timeApproved = currentTime;
                    mapDetailsCreationObject.users_maps_details_approvedByTousers = { connect: { id: submittingUser.id } };
                }


                if (mapperUserID) {
                    const userFromID = await prisma.users.findUnique({ where: { id: mapperUserID } });

                    if (!userFromID) throw invalidMapperUserIdErrorMessage + `${mapperUserID}`;

                    mapDetailsCreationObject.users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserID } };
                }
                else if (mapperNameString) {
                    mapDetailsCreationObject.mapperNameString = mapperNameString;
                }
                else {
                    const mapperUserIdFromID = mapFromID.maps_details[0].mapperUserID;
                    if (mapperUserIdFromID) {
                        mapDetailsCreationObject.users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserIdFromID } };
                    }
                    mapDetailsCreationObject.mapperNameString = mapFromID.maps_details[0].mapperNameString;
                }


                if (modType === "Normal") {
                    if (chapter) {
                        mapDetailsCreationObject.chapter = chapter;
                    }
                    else {
                        const chapterFromID = Number(mapFromID.maps_details[0].chapter);

                        if (isNaN(chapterFromID)) {
                            res.status(400).json("The existing version of this map is somehow both Normal and lacks a chapter. Please include a chapter so this can be fixed.");
                            console.log(`maps_details (id: ${mapFromID.maps_details[0].id}, rev: ${mapFromID.maps_details[0].revision}) is Normal but lacks a chapter`);
                            return;
                        }

                        mapDetailsCreationObject.chapter = chapterFromID;
                    }


                    if (side) {
                        mapDetailsCreationObject.side = side;
                    }
                    else {
                        const sideFromID = mapFromID.maps_details[0].side;

                        if (!sideFromID) {
                            res.status(400).json("The existing version of this map is somehow both Normal and lacks a side. Please include a side so this can be fixed.");
                            console.log(`maps_details (id: ${mapFromID.maps_details[0].id}, rev: ${mapFromID.maps_details[0].revision}) is Normal but lacks a side`);
                            return;
                        }

                        mapDetailsCreationObject.side = sideFromID;
                    }
                }
                else {
                    if (modType === "Contest") {
                        mapDetailsCreationObject.overallRank = overallRank;
                    }


                    if (modDifficulty !== undefined) {
                        let validModDifficultyBool = false;
                        let modHasSubDifficultiesBool = false;

                        let modDifficultiesArray = await prisma.difficulties.findMany({
                            where: { parentModID: modID },
                            include: { other_difficulties: true },
                        });

                        if (!modDifficultiesArray.length) {
                            modHasSubDifficultiesBool = true;
                            modDifficultiesArray = await prisma.difficulties.findMany({
                                where: { parentModID: null },
                                include: { other_difficulties: true },
                            });
                        }
                        else {
                            for (const difficulty of modDifficultiesArray) {
                                if (difficulty.parentDifficultyID) {
                                    modHasSubDifficultiesBool = true;
                                    break;
                                }
                            }
                        }


                        if (!modDifficulty || (modHasSubDifficultiesBool && (!(modDifficulty instanceof Array) || modDifficulty.length !== 2))) throw invalidMapDifficultyErrorMessage;


                        if (modHasSubDifficultiesBool) {
                            const parentDifficultyName = modDifficulty[0];
                            const childDifficultyName = modDifficulty[1];

                            for (const parentDifficulty of modDifficultiesArray) {
                                if (parentDifficulty.name === parentDifficultyName) {
                                    for (const childDifficulty of parentDifficulty.other_difficulties) {
                                        if (childDifficulty.name === childDifficultyName) {
                                            mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: childDifficulty.id } };
                                            validModDifficultyBool = true;
                                            break;
                                        }
                                    }

                                    break;
                                }
                            }
                        }
                        else {
                            const difficultyName = <string>modDifficulty;
                            for (const difficulty of modDifficultiesArray) {
                                if (difficulty.name === difficultyName) {
                                    mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: difficulty.id } };
                                    validModDifficultyBool = true;
                                    break;
                                }
                            }
                        }


                        if (!validModDifficultyBool) throw invalidMapDifficultyErrorMessage;
                    }
                    else {
                        const difficultyIdFromId = mapFromID.maps_details[0].difficulties_difficultiesTomaps_details_modDifficultyID?.id;

                        if (!difficultyIdFromId) {
                            res.status(400).json(`The existing version of this map is somehow both non-Normal and lacks a modDifficulty.
                            Please include a modDifficulty so this can be fixed.`);
                            console.log(`maps_details (id: ${mapFromID.maps_details[0].id}, rev: ${mapFromID.maps_details[0].revision}) is non-Normal but lacks a modDifficulty`);
                            return;
                        }

                        mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: difficultyIdFromId } };
                    }
                }


                const techCreationObjectArray: mapToTechCreationObject[] = [];
                const existingTechConnectionObjectsArray = mapFromID.maps_details[0].maps_to_tech;
                let techsExistBoolean = false;

                if (techAny) {
                    techsExistBoolean = true;

                    techAny.forEach((techName) => {
                        const techCreationObject = {
                            tech_list: { connect: { name: techName } },
                            fullClearOnlyBool: false,
                        };

                        techCreationObjectArray.push(techCreationObject);
                    });
                }

                if (techFC) {
                    techsExistBoolean = true;

                    techFC.forEach((techName) => {
                        const techCreationObject = {
                            tech_list: { connect: { name: techName } },
                            fullClearOnlyBool: true,
                        };

                        techCreationObjectArray.push(techCreationObject);
                    });
                }

                if ((!techAny || !techFC) && existingTechConnectionObjectsArray.length) {
                    techsExistBoolean = true;

                    existingTechConnectionObjectsArray.forEach((techConnectionObject) => {
                        if (!techAny && !techConnectionObject.fullClearOnlyBool) {
                            const techCreationObject = {
                                tech_list: { connect: { id: techConnectionObject.techID } },
                                fullClearOnlyBool: false,
                            };

                            techCreationObjectArray.push(techCreationObject);
                        }
                        else if (!techFC && techConnectionObject.fullClearOnlyBool) {
                            const techCreationObject = {
                                tech_list: { connect: { id: techConnectionObject.techID } },
                                fullClearOnlyBool: true,
                            };

                            techCreationObjectArray.push(techCreationObject);
                        }
                    });
                }

                if (techsExistBoolean) {
                    mapDetailsCreationObject.maps_to_tech = { create: techCreationObjectArray };
                }


                const createdMapDetails = await prisma.maps_details.create({ data: mapDetailsCreationObject });


                const innerRawMap = await prisma.maps_ids.findUnique({
                    where: { id: mapID },
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
                            where: { id: createdMapDetails.id },
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech: { include: { tech_list: true } },
                            },
                        },
                    },
                });


                return innerRawMap;
            });

            if (!outerRawMap) return;


            const formattedMap = formatMap(outerRawMap, modType);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const id = <number>req.id;

            await prisma.maps_ids.delete({ where: { id: id } });

            res.status(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.use(noRouteError);

mapsRouter.use(errorHandler);




export const mapPost = <expressRoute>async function (req, res, next) {  //called from mods.ts
    try {
        const modID = <number>req.id;
        const modFromID = <rawMod>req.mod;
        const modType = modFromID.mods_details[0].type;
        const name: string = req.body.name;
        const minimumModRevision: number = !req.body.minimumModRevision ? modFromID.mods_details[0].revision : req.body.minimumModRevision;
        const canonicalDifficultyName: string | undefined = req.body.canonicalDifficulty === null ? undefined : req.body.canonicalDifficulty;
        const lengthName: string = req.body.length;
        const description: string | undefined = req.body.description === null ? undefined : req.body.description;
        const notes: string | undefined = req.body.notes === null ? undefined : req.body.notes;
        const mapperUserID: number | undefined = req.body.mapperUserID === null ? undefined : req.body.mapperUserID;
        const mapperNameString: string | undefined = req.body.mapperNameString === null ? undefined : req.body.mapperNameString;
        const chapter: number | undefined = req.body.chapter === null ? undefined : req.body.chapter;
        const side: maps_details_side | undefined = req.body.side === null ? undefined : req.body.side;
        const modDifficulty: string | string[] | undefined = req.body.modDifficulty === null ? undefined : req.body.modDifficulty;
        const overallRank: number | null | undefined = req.body.overallRank;
        const mapRemovedFromModBool: boolean = !req.body.mapRemovedFromModBool ? false : req.body.mapRemovedFromModBool;
        const techAny: string[] | undefined = req.body.techAny === null ? undefined : req.body.techAny;
        const techFC: string[] | undefined = req.body.techFC === null ? undefined : req.body.techFC;
        const currentTime = getCurrentTime();


        const valid = validateMapPost({
            name: name,
            minimumModRevision: minimumModRevision,
            canonicalDifficulty: canonicalDifficultyName,
            length: lengthName,
            description: description,
            notes: notes,
            mapperUserID: mapperUserID,
            mapperNameString: mapperNameString,
            chapter: chapter,
            side: side,
            modDifficulty: modDifficulty,
            overallRank: overallRank,
            mapRemovedFromModBool: mapRemovedFromModBool,
            techAny: techAny,
            techFC: techFC,
        });

        if (!valid || (modDifficulty && modType === "Normal")) {
            res.status(400).json("Malformed request body");
            return;
        }

        if (modType !== "Normal" && !modDifficulty) {
            res.status(400).json(invalidMapDifficultyErrorMessage);
            return;
        }


        const canonicalDifficultyID = await getCanonicalDifficultyID(canonicalDifficultyName, techAny);
        const lengthID = await getLengthID(lengthName);


        const mapIdCreationObject: mapIdCreationObjectStandalone = {
            modID: modID,
            minimumModRevision: minimumModRevision,
            map_details: {
                create: [{
                    name: name,
                    canonicalDifficulty: canonicalDifficultyID,
                    map_lengths: { connect: { id: lengthID } },
                    description: description,
                    notes: notes,
                    mapRemovedFromModBool: mapRemovedFromModBool,
                    timeSubmitted: currentTime,
                    users_maps_details_submittedByTousers: { connect: { id: submittingUser.id } }
                }]
            }
        }


        const privilegedUserBool = privilegedUser(submittingUser);

        if (isErrorWithMessage(privilegedUserBool)) throw privilegedUserBool;

        if (privilegedUserBool) {
            mapIdCreationObject.map_details.create[0].timeApproved = currentTime;
            mapIdCreationObject.map_details.create[0].users_maps_details_approvedByTousers = { connect: { id: submittingUser.id } };
        }


        if (mapperUserID) {
            const userFromID = await prisma.users.findUnique({ where: { id: mapperUserID } });

            if (!userFromID) throw invalidMapperUserIdErrorMessage + `${mapperUserID}`;

            mapIdCreationObject.map_details.create[0].users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserID } };
        }
        else if (mapperNameString) {
            mapIdCreationObject.map_details.create[0].mapperNameString = mapperNameString;
        }


        if (modType === "Normal") {
            mapIdCreationObject.map_details.create[0].chapter = chapter;
            mapIdCreationObject.map_details.create[0].side = side;
        }
        else {
            if (modType === "Contest") {
                mapIdCreationObject.map_details.create[0].overallRank = overallRank;
            }


            let validModDifficultyBool = false;
            let modHasSubDifficultiesBool = false;

            let modDifficultiesArray = await prisma.difficulties.findMany({
                where: { parentModID: modID },
                include: { other_difficulties: true },
            });

            if (!modDifficultiesArray.length) {
                modHasSubDifficultiesBool = true;
                modDifficultiesArray = await prisma.difficulties.findMany({
                    where: { parentModID: null },
                    include: { other_difficulties: true },
                });
            }
            else {
                for (const difficulty of modDifficultiesArray) {
                    if (difficulty.parentDifficultyID) {
                        modHasSubDifficultiesBool = true;
                        break;
                    }
                }
            }


            if (!modDifficulty || (modHasSubDifficultiesBool && (!(modDifficulty instanceof Array) || modDifficulty.length !== 2))) throw invalidMapDifficultyErrorMessage;


            if (modHasSubDifficultiesBool) {
                const parentDifficultyName = modDifficulty[0];
                const childDifficultyName = modDifficulty[1];

                for (const parentDifficulty of modDifficultiesArray) {
                    if (parentDifficulty.name === parentDifficultyName) {
                        for (const childDifficulty of parentDifficulty.other_difficulties) {
                            if (childDifficulty.name === childDifficultyName) {
                                mapIdCreationObject.map_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: childDifficulty.id } };
                                validModDifficultyBool = true;
                                break;
                            }
                        }

                        break;
                    }
                }
            }
            else {
                const difficultyName = <string>modDifficulty;
                for (const difficulty of modDifficultiesArray) {
                    if (difficulty.name === difficultyName) {
                        mapIdCreationObject.map_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: difficulty.id } };
                        validModDifficultyBool = true;
                        break;
                    }
                }
            }


            if (!validModDifficultyBool) throw invalidMapDifficultyErrorMessage;
        }


        if (techAny || techFC) {
            const techCreationObjectArray: mapToTechCreationObject[] = [];


            if (techAny) {
                techAny.forEach((techName) => {
                    const techCreationObject = {
                        tech_list: { connect: { name: techName } },
                        fullClearOnlyBool: false,
                    };

                    techCreationObjectArray.push(techCreationObject);
                });
            }


            if (techFC) {
                techFC.forEach((techName) => {
                    const techCreationObject = {
                        tech_list: { connect: { name: techName } },
                        fullClearOnlyBool: true,
                    };

                    techCreationObjectArray.push(techCreationObject);
                });
            }


            mapIdCreationObject.map_details.create[0].maps_to_tech = { create: techCreationObjectArray };
        }


        const rawMap = await prisma.maps_ids.create({
            data: mapIdCreationObject,
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
                        maps_to_tech: { include: { tech_list: true } },
                    },
                },
            },
        });

        const formattedMap = formatMap(rawMap, modType);

        if (isErrorWithMessage(formattedMap)) throw formattedMap;


        res.json(formattedMap);
    }
    catch (error) {
        next(error);
    }
}




export { mapsRouter };
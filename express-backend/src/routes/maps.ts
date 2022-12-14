import express, { } from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import {
    invalidMapperUserIdErrorMessage, param_mapID, formatMap, param_mapRevision, getCanonicalDifficultyID, invalidMapDifficultyErrorMessage, noMapDetailsErrorMessage
} from "../helperFunctions/maps-mods-publishers";
import { param_userID } from "../helperFunctions/users";
import { param_lengthID, param_lengthOrder, checkLengthID, lengthErrorMessage } from "../helperFunctions/lengths";
import { getCurrentTime } from "../helperFunctions/utils";
import { mapStaffPermsArray, checkPermissions, checkSessionAge } from "../helperFunctions/sessions";

import { validateMapPost, validateMapPatch } from "../jsonSchemas/maps-mods-publishers";

import { mods_details_type, maps_details_side } from ".prisma/client";
import { rawMap, mapIdCreationObjectStandalone, mapToTechCreationObject, rawMod, mapDetailsCreationObjectStandalone, mapValidationJson } from "../types/internal";
import { expressRoute } from "../types/express";


const mapsRouter = express.Router();




//comment out for production
// const submittingUser: submitterUser = {
//     id: 1,
//     displayName: "steve",
//     discordID: "5",
//     discordUsername: "steve",
//     discordDiscrim: "5555",
//     displayDiscord: false,
//     timeCreated: 1,
//     permissions: "",
//     permissionsArray: [],
//     accountStatus: "Active",
//     timeDeletedOrBanned: null,
// };




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
                                include: { publishers: true },
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

            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                            AND: {
                                NOT: { timeApproved: null },
                                name: { startsWith: query },
                            },
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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            AND: {
                                NOT: { timeApproved: null },
                                name: { startsWith: query },
                            },
                        },
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

            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                            AND: {
                                NOT: { timeApproved: null },
                                mapperNameString: { startsWith: query },
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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            AND: {
                                NOT: { timeApproved: null },
                                mapperNameString: { startsWith: query },
                            },
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                            AND: {
                                NOT: { timeApproved: null },
                                maps_to_tech: { some: { tech_list: { name: query } } },
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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            AND: {
                                NOT: { timeApproved: null },
                                maps_to_tech: { some: { tech_list: { name: query } } },
                            },
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                            AND: {
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
                },
                include: {
                    mods_ids: {
                        include: {
                            mods_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            AND: {
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                            AND: {
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
                },
                include: {
                    mods_ids: {
                        include: {
                            mods_details: {
                                where: { NOT: { timeApproved: null } },
                                orderBy: { revision: "desc" },
                                take: 1,
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            AND: {
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            NOT: { timeApproved: null },
                            lengthID: lengthID,
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            NOT: { timeApproved: null },
                            lengthID: lengthID,
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            NOT: { timeApproved: null },
                            mapperUserID: userID,
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


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
                                include: { publishers: true },
                            },
                        },
                    },
                    maps_details: {
                        where: {
                            NOT: { timeApproved: null },
                            submittedBy: userID,
                        },
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


            const formattedMaps = await Promise.all(
                rawMaps.map(
                    async (rawMap) => {
                        const formattedMap = await formatMap(rawMap);

                        if (isErrorWithMessage(formattedMap)) throw formattedMap;

                        if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}:` + noMapDetailsErrorMessage;

                        return formattedMap;
                    }));


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
                                include: { publishers: true },
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


            const formattedMap = await formatMap(rawMap);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;

            if (formattedMap === noMapDetailsErrorMessage) {
                res.status(400).json(noMapDetailsErrorMessage);
                return;
            }


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
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const mapId = <number>req.id;
            const revision = <number>req.revision;
            const currentTime = getCurrentTime();
            const submitterId = <number>req.session.userID;


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
                        users_maps_details_approvedByTousers: { connect: { id: submitterId } },
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
                                    include: { publishers: true },
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


            const formattedMap = await formatMap(outerRawMap);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;

            if (formattedMap === noMapDetailsErrorMessage) {
                res.status(400).json(noMapDetailsErrorMessage);
                return;
            }


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
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


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


            res.sendStatus(204);
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
                                include: { publishers: true },
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


            const formattedMap = await formatMap(rawMap);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;

            if (formattedMap === noMapDetailsErrorMessage) {
                res.status(400).json(noMapDetailsErrorMessage);
                return;
            }


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
                                include: { publishers: true },
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


            const formattedMap = await formatMap(rawMap);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;

            if (formattedMap === noMapDetailsErrorMessage) {
                res.status(400).json(noMapDetailsErrorMessage);
                return;
            }


            res.json(formattedMap);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, [], true, res);
            if (!permission) return;


            const mapID = req.id!;
            const mapFromID = req.map!;
            const modID = mapFromID.modID;
            const modType = mapFromID.mods_ids?.mods_details[0].type!;
            const publisherName = <string>mapFromID.mods_ids?.mods_details[0].publishers.name;
            let name: string = req.body.name;
            const canonicalDifficulty: number | null | undefined = req.body.canonicalDifficulty;
            let lengthID: number | undefined = req.body.length
            let description: string | null = req.body.description;
            let notes: string | null = req.body.notes;
            let mapperUserID: number | null = req.body.mapperUserID;
            let mapperNameString: string | undefined = req.body.mapperNameString;
            const chapter: number | undefined = req.body.chapter;
            const side: maps_details_side | undefined = req.body.side;
            const modDifficulty: number | undefined = req.body.modDifficulty;
            const overallRank: number | null | undefined = req.body.overallRank;
            let mapRemovedFromModBool: boolean = req.body.mapRemovedFromModBool;
            const techAny: number[] | undefined = req.body.techAny === null ? undefined : req.body.techAny;
            const techFC: number[] | undefined = req.body.techFC === null ? undefined : req.body.techFC;
            const timeCreated: number | undefined = req.body.timeCreated === null ? undefined : req.body.timeCreated;
            const currentTime = getCurrentTime();


            const submittingUserId = req.session.userID!;


            const validationJson: mapValidationJson = {
                name: name,
                canonicalDifficulty: canonicalDifficulty,
                lengthID: lengthID,
                description: description,
                notes: notes,
                mapperUserID: mapperUserID,
                mapperNameString: mapperNameString,
                modDifficulty: modDifficulty,
                overallRank: overallRank,
                mapRemovedFromModBool: mapRemovedFromModBool,
                techAny: techAny,
                techFC: techFC,
                timeCreated: timeCreated,
            };

            if (chapter || side) {
                validationJson.chapter = chapter;
                validationJson.side = side;
            }
            else if (modDifficulty || overallRank !== undefined) {
                validationJson.modDifficulty = modDifficulty;
                validationJson.overallRank = overallRank;
            }


            const valid = validateMapPatch(validationJson);

            if (!valid || (modDifficulty && modType === "Normal") || (!name && canonicalDifficulty === undefined && !lengthID && description === undefined &&
                notes === undefined && mapperUserID === undefined && !mapperNameString && !chapter && !side && !modDifficulty && overallRank === undefined
                && !mapRemovedFromModBool && !techAny && !techFC && !timeCreated)) {

                res.status(400).json("Malformed request body");
                return;
            }


            if (!name) name = mapFromID.maps_details[0].name;

            if (description === undefined) description = mapFromID.maps_details[0].description;

            if (notes === undefined) notes = mapFromID.maps_details[0].notes;

            if (mapperUserID === undefined) mapperUserID = mapFromID.maps_details[0].mapperUserID;

            if (!mapRemovedFromModBool) mapRemovedFromModBool = mapFromID.maps_details[0].mapRemovedFromModBool;


            const outerRawMap = await prisma.$transaction(async () => {
                const latestRevisionObject = await prisma.maps_details.findFirst({
                    where: { mapId: mapID },
                    orderBy: { revision: "desc" },
                    take: 1,
                });

                if (!latestRevisionObject) throw `Map ${mapID} does not have any map details!`;

                const newRevisionNumber = latestRevisionObject.revision + 1;


                const privilegedUserBool = await checkPermissions(req, mapStaffPermsArray);


                let canonicalDifficultyID: number;
                if (canonicalDifficulty === undefined) {
                    canonicalDifficultyID = mapFromID.maps_details[0].canonicalDifficultyID;
                }
                else {
                    canonicalDifficultyID = await getCanonicalDifficultyID(canonicalDifficulty, techAny, privilegedUserBool);
                }


                if (lengthID) {
                    await checkLengthID(lengthID);
                }
                else {
                    lengthID = mapFromID.maps_details[0].lengthID;
                }


                if (mapperUserID) {
                    const userFromID = await prisma.users.findUnique({ where: { id: mapperUserID } });

                    if (!userFromID) throw invalidMapperUserIdErrorMessage + `${mapperUserID}`;

                    mapperNameString = userFromID.displayName;
                }
                else if (modType === "Normal") {
                    mapperNameString = publisherName;
                }
                else if (!mapperNameString) {
                    mapperUserID = mapFromID.maps_details[0].mapperUserID;
                    mapperNameString = mapFromID.maps_details[0].mapperNameString;
                }


                const mapDetailsCreationObject: mapDetailsCreationObjectStandalone = {
                    maps_ids: { connect: { id: mapID } },
                    revision: newRevisionNumber,
                    name: name,
                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: { connect: { id: canonicalDifficultyID } },
                    map_lengths: { connect: { id: lengthID } },
                    description: description,
                    notes: notes,
                    mapperNameString: mapperNameString,
                    mapRemovedFromModBool: mapRemovedFromModBool,
                    timeSubmitted: currentTime,
                    users_maps_details_submittedByTousers: { connect: { id: submittingUserId } },
                    timeCreated: !timeCreated ? latestRevisionObject.timeCreated : timeCreated,
                };


                if (mapperUserID) {
                    mapDetailsCreationObject.users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserID } };
                }


                if (privilegedUserBool) {
                    mapDetailsCreationObject.timeApproved = currentTime;
                    mapDetailsCreationObject.users_maps_details_approvedByTousers = { connect: { id: submittingUserId } };
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


                        if (!modDifficulty) throw invalidMapDifficultyErrorMessage;


                        if (modHasSubDifficultiesBool) {
                            outerLoop: for (const parentDifficulty of modDifficultiesArray) {
                                if (parentDifficulty.id === modDifficulty) {
                                    mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
                                    validModDifficultyBool = true;
                                    break;
                                }


                                for (const childDifficulty of parentDifficulty.other_difficulties) {
                                    if (childDifficulty.id === modDifficulty) {
                                        mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
                                        validModDifficultyBool = true;
                                        break outerLoop;
                                    }
                                }
                            }
                        }
                        else {
                            for (const difficulty of modDifficultiesArray) {
                                if (difficulty.id === modDifficulty) {
                                    mapDetailsCreationObject.difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
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

                    techAny.forEach((techID) => {
                        const techCreationObject = {
                            tech_list: { connect: { id: techID } },
                            fullClearOnlyBool: false,
                        };

                        techCreationObjectArray.push(techCreationObject);
                    });
                }

                if (techFC) {
                    techsExistBoolean = true;

                    techFC.forEach((techID) => {
                        const techCreationObject = {
                            tech_list: { connect: { id: techID } },
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
                                    include: { publishers: true },
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

            if (!outerRawMap) {
                console.log("outerRawMap is undefined");
                return;
            }


            const formattedMap = await formatMap(outerRawMap);

            if (isErrorWithMessage(formattedMap)) throw formattedMap;

            if (formattedMap === noMapDetailsErrorMessage) {
                res.status(400).json(noMapDetailsErrorMessage);
                return;
            }


            res.json(formattedMap);
        }
        catch (error) {
            if (typeof error === "string" && error.includes(invalidMapperUserIdErrorMessage)) {
                res.status(404).json(error);
            }
            else if (error === invalidMapDifficultyErrorMessage) {
                res.status(400).json(invalidMapDifficultyErrorMessage);
            }
            else {
                next(error);
            }
        }
    })
    .delete(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const id = <number>req.id;

            await prisma.maps_ids.delete({ where: { id: id } });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




mapsRouter.use(noRouteError);

mapsRouter.use(errorHandler);




export const mapPost = <expressRoute>async function (req, res, next) {  //called from ./mods.ts
    try {
        const permission = await checkPermissions(req, [], true, res);
        if (!permission) return;


        const modID = <number>req.id;
        const modFromID = <rawMod>req.mod;
        const modType = modFromID.mods_details[0].type;
        const publisherName: string = modFromID.mods_details[0].publishers.name;
        const name: string = req.body.name;
        const minimumModRevision: number = !req.body.minimumModRevision ? modFromID.mods_details[0].revision : req.body.minimumModRevision;
        const canonicalDifficulty: number | undefined = req.body.canonicalDifficulty === null ? undefined : req.body.canonicalDifficulty;
        const lengthID: number = req.body.length;
        const description: string | undefined = req.body.description === null ? undefined : req.body.description;
        const notes: string | undefined = req.body.notes === null ? undefined : req.body.notes;
        const mapperUserID: number | undefined = req.body.mapperUserID === null ? undefined : req.body.mapperUserID;
        let mapperNameString: string | undefined = req.body.mapperNameString;
        const chapter: number | undefined = req.body.chapter === null ? undefined : req.body.chapter;
        const side: maps_details_side | undefined = req.body.side === null ? undefined : req.body.side;
        const modDifficulty: number | undefined = req.body.modDifficulty === null ? undefined : req.body.modDifficulty;
        const overallRank: number | null | undefined = req.body.overallRank;
        const mapRemovedFromModBool: boolean = !req.body.mapRemovedFromModBool ? false : req.body.mapRemovedFromModBool;
        const techAny: number[] | undefined = req.body.techAny === null ? undefined : req.body.techAny;
        const techFC: number[] | undefined = req.body.techFC === null ? undefined : req.body.techFC;
        const timeCreated: number = req.body.timeCreated === null ? undefined : req.body.timeCreated;
        const currentTime = getCurrentTime();


        const submitterUserID = <number>req.session.userID;


        const valid = validateMapPost({
            name: name,
            minimumModRevision: minimumModRevision,
            canonicalDifficulty: canonicalDifficulty,
            length: lengthID,
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
            timeCreated: timeCreated,
        });

        if (!valid) {
            res.status(400).json("Malformed request body");
            return;
        }

        if ((modDifficulty || overallRank) && modType === "Normal") {
            res.status(400).json("modDifficulty and overallRank cannot be included in a Normal mod");
            return;
        }

        if (modType !== "Normal" && !modDifficulty) {
            res.status(400).json(invalidMapDifficultyErrorMessage);
            return;
        }


        const privilegedUserBool = await checkPermissions(req, mapStaffPermsArray);

        if (isErrorWithMessage(privilegedUserBool)) throw privilegedUserBool;


        const canonicalDifficultyID = await getCanonicalDifficultyID(canonicalDifficulty, techAny, privilegedUserBool);


        if (mapperUserID) {
            const userFromID = await prisma.users.findUnique({ where: { id: mapperUserID } });

            if (!userFromID) throw invalidMapperUserIdErrorMessage + `${mapperUserID}`;

            mapperNameString = userFromID.displayName;
        }
        else if (modType === "Normal") {
            mapperNameString = publisherName;
        }
        else if (!mapperNameString) {
            throw "Non-Normal mods must have mapperUserID or mapperNameString";
        }


        const mapIdCreationObject: mapIdCreationObjectStandalone = {
            modID: modID,
            minimumModRevision: minimumModRevision,
            maps_details: {
                create: [{
                    name: name,
                    difficulties_difficultiesTomaps_details_canonicalDifficultyID: { connect: { id: canonicalDifficultyID } },
                    map_lengths: { connect: { id: lengthID } },
                    description: description,
                    notes: notes,
                    mapperNameString: mapperNameString,
                    mapRemovedFromModBool: mapRemovedFromModBool,
                    timeSubmitted: currentTime,
                    users_maps_details_submittedByTousers: { connect: { id: submitterUserID } },
                    timeCreated: timeCreated,
                }]
            }
        }


        if (mapperUserID) {
            mapIdCreationObject.maps_details.create[0].users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserID } };
        }


        if (privilegedUserBool) {
            mapIdCreationObject.maps_details.create[0].timeApproved = currentTime;
            mapIdCreationObject.maps_details.create[0].users_maps_details_approvedByTousers = { connect: { id: submitterUserID } };
        }


        if (modType === "Normal") {
            mapIdCreationObject.maps_details.create[0].chapter = chapter;
            mapIdCreationObject.maps_details.create[0].side = side;
        }
        else {
            if (modType === "Contest") {
                mapIdCreationObject.maps_details.create[0].overallRank = overallRank;
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


            if (!modDifficulty) throw invalidMapDifficultyErrorMessage;


            if (modHasSubDifficultiesBool) {
                outerLoop: for (const parentDifficulty of modDifficultiesArray) {
                    if (parentDifficulty.id === modDifficulty) {
                        mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
                        validModDifficultyBool = true;
                        break;
                    }


                    for (const childDifficulty of parentDifficulty.other_difficulties) {
                        if (childDifficulty.id === modDifficulty) {
                            mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
                            validModDifficultyBool = true;
                            break outerLoop;
                        }
                    }
                }
            }
            else {
                for (const difficulty of modDifficultiesArray) {
                    if (difficulty.id === modDifficulty) {
                        mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: modDifficulty } };
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
                techAny.forEach((techID) => {
                    const techCreationObject = {
                        tech_list: { connect: { id: techID } },
                        fullClearOnlyBool: false,
                    };

                    techCreationObjectArray.push(techCreationObject);
                });
            }


            if (techFC) {
                techFC.forEach((techID) => {
                    const techCreationObject = {
                        tech_list: { connect: { id: techID } },
                        fullClearOnlyBool: true,
                    };

                    techCreationObjectArray.push(techCreationObject);
                });
            }


            mapIdCreationObject.maps_details.create[0].maps_to_tech = { create: techCreationObjectArray };
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
                            include: { publishers: true },
                        },
                    },
                },
                maps_details: {
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

        console.log(rawMap)

        const formattedMap = await formatMap(rawMap);

        if (isErrorWithMessage(formattedMap)) throw formattedMap;

        if (formattedMap === noMapDetailsErrorMessage) {
            res.status(400).json(noMapDetailsErrorMessage);
            return;
        }


        res.json(formattedMap);
    }
    catch (error) {
        if (typeof error === "string" && error.includes(invalidMapperUserIdErrorMessage)) {
            res.status(404).json(error);
        }
        else if (error === invalidMapDifficultyErrorMessage) {
            res.status(400).json(invalidMapDifficultyErrorMessage);
        }
        else if (error === lengthErrorMessage) {
            res.status(404).json(lengthErrorMessage);
            res.errorSent = true;
            return;
        }
        else {
            next(error);
        }
    }
}




export { mapsRouter };
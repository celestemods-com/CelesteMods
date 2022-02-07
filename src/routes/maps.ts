import express, { NextFunction, Response } from "express";
import { prisma } from "../prismaClient";
import { validateMapPost, validateMapPatch } from "../jsonSchemas/maps-mods-publishers";
import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mods_details, mods_details_type, publishers } from ".prisma/client";
import {
    rawMod, rawMap, createParentDifficultyForMod, createChildDifficultyForMod, difficultyNamesForModArrayElement, jsonCreateMapWithMod,
    mapIdCreationObject, mapDetailsCreationObject, mapToTechCreationObject, defaultDifficultyForMod, modDetailsCreationObject,
    loneModDetailsCreationObject, submitterUser, publisherConnectionObject
} from "../types/internal";
import { formattedMod, formattedMap } from "../types/frontend";
import { formatMod, getPublisherConnectionObject, getDifficultyArrays, getMapIDsCreationArray, param_userID, param_modID,
    param_mapID, param_modRevision, connectMapsToModDifficulties, formatMap, privilegedUser } from "../helperFunctions/maps-mods-publishers";
import { getCurrentTime } from "../helperFunctions/utils";


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


mapsRouter.param("mapRvision",async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});




mapsRouter.route("/:mapID/revisions")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision/accept")
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision/reject")
    .post(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


mapsRouter.route("/:mapID/revisions/:mapRevision")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




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




export { mapsRouter };
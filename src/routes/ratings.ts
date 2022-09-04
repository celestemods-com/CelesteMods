import express, { Request, Response } from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { param_modID, param_mapID } from "../helperFunctions/maps-mods-publishers";
import { param_userID } from "../helperFunctions/users";
import { formatRating, formatRatings, getRatingInfo, getRatingInfoTreeObject } from "../helperFunctions/ratings";
import { adminPermsArray, checkPermissions, checkSessionAge } from "../helperFunctions/sessions";
import { getCurrentTime } from "../helperFunctions/utils";
import { isValidDifficultyID } from "../helperFunctions/difficulties";

import { validateRatingPost, validateRatingPatch } from "../jsonSchemas/ratings";

import {
    rawRating, createRatingData, updateRatingDataConnectDifficulty, updateRatingDataNullDifficulty, ratingsTreeObjectType, ratingsInfosTreeObjectType
} from "../types/internal";


const router = express.Router();
export { router as ratingsRouter };




router.route("/")
    .get(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const rawRatings = await prisma.ratings.findMany({ include: { difficulties: true } });


            if (!rawRatings) {
                res.json([]);
                return;
            }


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, [], true, res);

            if (!permitted) return;


            const mapID = <number>req.body.mapID;
            const quality: number | null = req.body.quality === undefined ? null : req.body.quality;
            const difficultyID: number | undefined = !req.body.difficultyID ? undefined : req.body.difficultyID;
            const permission = await checkPermissions(req, [], true, res);
            if (!permission) return;


            const currentTime = getCurrentTime();

            const userID = <number>req.session.userID;  //must be defined, otherwise checkPermissions would have returned false


            const valid = validateRatingPost({
                mapID: mapID,
                quality: quality,
                difficultyID: difficultyID,
            });

            if (!valid) {
                res.errorSent = true;
                res.status(400).json("Malformed request body");
                return;
            }


            const rawRatingFromMapID = await prisma.ratings.findUnique({
                where: {
                    mapID_submittedBy: {
                        mapID: mapID,
                        submittedBy: userID,
                    },
                },
                include: { difficulties: true },
            });

            if (rawRatingFromMapID) {
                const formattedRatingFromID = formatRating(rawRatingFromMapID);

                if (isErrorWithMessage(formattedRatingFromID)) throw formattedRatingFromID;


                res.status(200).json(formattedRatingFromID);    //don't need to check for perms. the submitting user will always be the same as the matching rating's user

                return;
            }


            const createRatingObject: createRatingData = {
                maps_ids: { connect: { id: mapID } },
                users: { connect: { id: userID } },
                timeSubmitted: currentTime,
                quality: quality,
            };

            if (difficultyID) {
                const difficultyFromID = await isValidDifficultyID(difficultyID, true, true);

                if (!difficultyFromID) {
                    res.sendStatus(404).json(`${difficultyID} is not a valid difficultyID!`);
                    return;
                }


                createRatingObject.difficulties = { connect: { id: difficultyID } };
            }


            const rawRating = await prisma.ratings.create({
                data: createRatingObject,
                include: { difficulties: true },
            });


            const formattedRating = formatRating(rawRating);

            if (isErrorWithMessage(formattedRating)) throw formattedRating;


            res.status(201).json(formattedRating);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .all(noRouteError);


router.route("/search/mod")
    .get(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawRatings = await prisma.ratings.findMany({
                where: {
                    maps_ids: {
                        mods_ids: {
                            mods_details: {
                                some: {
                                    AND: {
                                        NOT: { timeApproved: null },
                                        name: { startsWith: query },
                                    },
                                },
                            },
                        },
                    },
                },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/search/map")
    .get(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawRatings = await prisma.ratings.findMany({
                where: {
                    maps_ids: {
                        maps_details: {
                            some: {
                                AND: {
                                    NOT: { timeApproved: null },
                                    name: { startsWith: query },
                                },
                            },
                        },
                    },
                },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/search/user")
    .get(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawRatings = await prisma.ratings.findMany({
                where: { users: { displayName: { startsWith: query } } },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
    param_modID(req, res, next);
});


router.route("/mods/:modID/full")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const rawRatings = await prisma.ratings.findMany({
                where: { maps_ids: { modID: modID } },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/mods/:modID")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const ratings = await prisma.ratings.findMany({ where: { maps_ids: { modID: modID } } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            const ratingsInfo = await getRatingInfo(ratings);


            res.json(ratingsInfo);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/mods")
    .get(async function (_req, res, next) {
        try {
            const ratings = await prisma.ratings.findMany({ include: { maps_ids: { select: { modID: true } } } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            let ratingsTreeObject: ratingsTreeObjectType = {};

            for (const rating of ratings) {
                const modID = rating.maps_ids.modID;


                if (ratingsTreeObject[modID]) ratingsTreeObject[modID].push(rating);
                else ratingsTreeObject[modID] = [rating];
            }


            const ratingsInfosTreeObject = await getRatingInfoTreeObject(ratingsTreeObject);


            res.json(ratingsInfosTreeObject);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", async function (req, res, next) {
    param_mapID(req, res, next);
});


router.route("/maps/:mapID/full")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id;


            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const rawRatings = await prisma.ratings.findMany({
                where: { mapID: mapID },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/maps/:mapID")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id;


            const ratings = await prisma.ratings.findMany({ where: { mapID: mapID } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            const ratingsInfo = await getRatingInfo(ratings);


            res.json(ratingsInfo);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/maps")
    .get(async function (_req, res, next) {
        try {
            const ratings = await prisma.ratings.findMany({ include: { maps_ids: true } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            let ratingsTreeObject: ratingsTreeObjectType = {};

            for (const rating of ratings) {
                const mapID = rating.mapID;

                
                if (ratingsTreeObject[mapID]) ratingsTreeObject[mapID].push(rating);
                else ratingsTreeObject[mapID] = [rating];
            }


            const ratingsInfosTreeObject = await getRatingInfoTreeObject(ratingsTreeObject);


            res.json(ratingsInfosTreeObject);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    param_userID(req, res, next);
});


router.route("/users/:userID/full")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const rawRatings = await prisma.ratings.findMany({
                where: { submittedBy: userID },
                include: { difficulties: true },
            });


            const formattedRatings = formatRatings(rawRatings);


            res.json(formattedRatings);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("ratingID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.ratingID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("ratingID is not a number");
            return;
        }


        const ratingFromID = await prisma.ratings.findUnique({
            where: { id: id },
            include: { difficulties: true },
        });

        if (!ratingFromID) {
            res.status(404).json("ratingID does not exist");
            return;
        }


        req.rating = ratingFromID;
        req.id = id;
        req.id2 = ratingFromID.submittedBy;
        next();
    }
    catch (error) {
        next(error);
    }
});


router.route("/:ratingID")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const rawRating = <rawRating>req.rating;


            const formattedRating = formatRating(rawRating);

            if (isErrorWithMessage(formattedRating)) throw formattedRating;


            res.json(formattedRating);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const ratingID = <number>req.id;
            const userID = <number>req.id2;
            const quality: number | null = req.body.quality === undefined ? null : req.body.quality;
            const difficultyID: number | undefined = req.body.difficultyID;
            const currentTime = getCurrentTime();


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            const valid = validateRatingPatch({
                quality: quality,
                difficultyID: difficultyID,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            let updateRatingDataObject: updateRatingDataConnectDifficulty | updateRatingDataNullDifficulty

            if (difficultyID) {
                const difficultyFromID = await isValidDifficultyID(difficultyID, true, true);

                if (!difficultyFromID) {
                    res.status(404).json(`${difficultyID} is not a valid difficultyID!`);
                    return;
                }


                updateRatingDataObject = {
                    timeSubmitted: currentTime,
                    quality: quality,
                    difficulties: { connect: { id: difficultyID } },
                }
            }
            else {
                updateRatingDataObject = {
                    timeSubmitted: currentTime,
                    quality: quality,
                    difficultyID: null,
                }
            }


            const rawRating = await prisma.ratings.update({
                where: { id: ratingID },
                data: updateRatingDataObject,
                include: { difficulties: true },
            });


            const formattedRating = formatRating(rawRating);


            res.json(formattedRating);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const ratingID = <number>req.id;
            const userID = <number>req.id2;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.ratings.delete({ where: { id: ratingID } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);
import express from "express";
import { prisma } from "../prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { formatRating, formatRatings, getRatingsInfo } from "../helperFunctions/ratings";
import { adminPermsArray, checkPermissions, checkSessionAge } from "../helperFunctions/sessions";
import { getCurrentTime } from "../helperFunctions/utils";

import { validatePost } from "../jsonSchemas/ratings";

import { ratings, difficulties } from ".prisma/client";
import { formattedRating } from "../types/frontend";
import { rawRating, createRatingData } from "../types/internal";


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
            const quality = !req.body.quality ? undefined : <number>req.body.quality;
            const difficultyID = !req.body.difficultyID ? undefined : <number>req.body.difficultyID;
            const currentTime = getCurrentTime();

            const userID = <number>req.session.userID;  //must be defined, otherwise checkPermissions would have returned false


            const valid = validatePost({
                mapID: mapID,
                quality: quality,
                difficultyID: difficultyID,
            });

            if (!valid) {
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

            if (difficultyID) createRatingObject.difficulties = { connect: { id: difficultyID } };


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
    try {
        const idRaw: unknown = req.params.modID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("modID is not a number");
            return;
        }


        const modFromID = await prisma.mods_ids.findUnique({ where: { id: id } });

        if (!modFromID) {
            res.status(404).json("modID does not exist");
            return;
        }


        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


router.route("/mod/:modID/full")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id2;


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


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id2;


            const ratings = await prisma.ratings.findMany({ where: { maps_ids: { modID: modID } } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            const ratingsInfo = await getRatingsInfo(ratings);


            res.json(ratingsInfo);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", async function (req, res, next) {
    try {
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


        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


router.route("/map/:mapID/full")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id2;


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


router.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id2;


            const ratings = await prisma.ratings.findMany({ where: { mapID: mapID } });

            if (!ratings.length) {
                res.json(0);
                return;
            }


            const ratingsInfo = await getRatingsInfo(ratings);


            res.json(ratingsInfo);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.userID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("userID is not a number");
            return;
        }


        const userFromID = await prisma.users.findUnique({ where: { id: id } });

        if (!userFromID) {
            res.status(404).json("userID does not exist");
            return;
        }


        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
});


router.route("/user/:userID/full")
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
            const permission = await checkPermissions(req, adminPermsArray, true, res);
            if (!permission) return;


            const rawRating = <rawRating>req.rating;


            const formattedRating = formatRating(rawRating);

            if (isErrorWithMessage(formattedRating)) throw formattedRating;


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
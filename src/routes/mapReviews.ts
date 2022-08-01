import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { checkPermissions, checkSessionAge, adminPermsArray } from "../helperFunctions/sessions";
import { param_modID, param_mapID } from "../helperFunctions/maps-mods-publishers";
import { param_userID } from "../helperFunctions/users";
import { formatMapReviews, formatMapReview, param_mapReviewID } from "../helperFunctions/reviews-mapReviews";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { reviews_maps } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
import { rawMapReview } from "../types/internal";
import { expressRoute } from "../types/express";


const router = express.Router();
export { router as mapReviewsRouter };




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawMapReviews = await prisma.reviews_maps.findMany({
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                }
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .all(noRouteError);


router.route("/search/map")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { maps_ids: { maps_details: { some: { name: { startsWith: query, } } } } },
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                },
            });


            const formattedMapReviews = formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/search/user")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { users: { displayName: { startsWith: query } } } },
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                },
            });


            const formattedMapReviews = formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
    param_modID(req, res, next);
});


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { modID: modID } },
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                },
            });


            const formattedMapReviews = formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", async function (req, res, next) {
    param_mapID(req, res, next);
});


router.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { mapID: mapID },
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                },
            });


            const formattedMapReviews = formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    param_userID(req, res, next);
});


router.route("/user/:userID")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { submittedBy: userID } },
                include: {
                    map_lengths: true,
                    reviews: { select: { submittedBy: true } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapReviewID", async function (req, res, next) {
    param_mapReviewID(req, res, next);
});


router.route("/:mapReviewID")
    .get(async function (req, res, next) {
        try {
            const rawMapReview = <rawMapReview>req.mapReview;


            const formattedMapReview = await formatMapReview(rawMapReview);

            if (isErrorWithMessage(formattedMapReview)) throw formattedMapReview;


            res.json(formattedMapReview);
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
            const id = <number>req.id;
            const rawMapReview = <rawMapReview>req.mapReview;
            const userID = rawMapReview.reviews.submittedBy;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, adminPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.reviews_maps.delete({ where: { id: id } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);




export const mapReviewPost = <expressRoute>async function (req, res, next) {    //called from ./reviews.ts

}
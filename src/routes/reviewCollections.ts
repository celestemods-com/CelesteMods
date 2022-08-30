import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { mapReviewPost } from "./mapReviews";
import { formatReview, formatReviews, param_reviewCollectionID, param_reviewID } from "../helperFunctions/reviewCollections-reviews-mapReviews";
import { formatRatings } from "../helperFunctions/ratings";
import { checkPermissions, checkSessionAge, mapReviewersPermsArray, mapStaffPermsArray } from "../helperFunctions/sessions";
import { param_userID } from "../helperFunctions/users";
import { getCurrentTime } from "../helperFunctions/utils";
import { getLengthID, lengthErrorMessage } from "../helperFunctions/lengths";

import { validateReviewPatch, validateReviewPost } from "../jsonSchemas/reviewCollections-reviews-mapReviews";

import {
    createMapReviewData, createRatingData, createReviewData, jsonCreateMapReviewWithReview, rawRating, rawReview, updateRatingDataConnectDifficulty,
    updateRatingDataNullDifficulty
} from "../types/internal";
import { review_collections } from "@prisma/client";
import { reviewPost } from "./reviews";


const router = express.Router();
export { router as reviewCollectionsRouter };




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const reviewCollections = prisma.review_collections.findMany();


            res.json(reviewCollections);
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




router.route("/search")
    .all(noRouteError);



router.route("/search/users")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const reviewCollections = prisma.review_collections.findMany({ where: { users: { displayName: { startsWith: query } } } });


            res.json(reviewCollections);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    try {
        param_userID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/users/:userID")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            const reviewCollections = prisma.review_collections.findMany({ where: { userID: userID } });


            res.json(reviewCollections);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("reviewCollectionsID", async function (req, res, next) {
    try {
        param_reviewCollectionID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/:reviewCollectionID")
    .get(async function (req, res, next) {
        try {
            const reviewCollection = req.reviewCollection!;


            res.status(200).json(reviewCollection);
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
            const id = req.id!;
            const reviewCollection = req.reviewCollection!;
            const userID = reviewCollection.userID;


            let permitted: boolean;

            if (req?.session?.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.review_collections.delete({ where: { id: id } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, mapReviewersPermsArray, true, res);
            if (!permission) return;


            await reviewPost(req, res, next);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);
import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { reviews_maps } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
// import { createUserData, updateUserData } from "../types/internal";
import { expressRoute } from "../types/express";


const router = express.Router();
export { router as mapReviewsRouter };




router.route("/")
    .get(async function (req, res, next) {
        try {

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

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/search/user")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/user/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapReviewID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/:mapReviewID")
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




router.use(noRouteError);

router.use(errorHandler);




export const mapReviewPost = <expressRoute>async function (req, res, next) {    //called from ./reviews.ts

}
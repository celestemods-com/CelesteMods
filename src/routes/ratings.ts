import express from "express";
import { prisma } from "../prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { ratings } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
// import { createUserData, updateUserData } from "../types/internal";


const router = express.Router();
export { router as ratingsRouter };




router.route("/")
    .get(async function (req, res, next) {
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




router.route("/search")
    .all(methodNotAllowed);


router.route("/search/mod")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


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


router.route("/mod/:modID/average")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/mod/:modID/count")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/mod/:modID/full")
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


router.route("/map/:mapID/average")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/map/:mapID/count")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/map/:mapID/full")
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


router.route("/user/:userID/average")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/user/:userID/count")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/user/:userID/full")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("ratingID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/:ratingID")
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
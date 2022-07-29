import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { reviews } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
// import { createUserData, updateUserData } from "../types/internal";


const router = express.Router();
export { router as reviewsRouter };




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
    .all(noRouteError);


router.route("/search/mod")
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


router.route("/mods/:modID")
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


router.route("/users/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("reviewID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


router.route("/:reviewID")
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
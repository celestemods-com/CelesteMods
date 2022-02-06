import express, { NextFunction, Response } from "express";
import { prisma } from "../prismaClient";
import { validatePublisherPatch } from "../jsonSchemas/maps-mods-publishers";
import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mods_details, mods_details_type, publishers } from ".prisma/client";
import {
    rawMod, rawMap, rawPublisher, createParentDifficultyForMod, createChildDifficultyForMod, difficultyNamesForModArrayElement, jsonCreateMapWithMod,
    mapIdCreationObject, mapDetailsCreationObject, mapToTechCreationObject, defaultDifficultyForMod, modDetailsCreationObject,
    loneModDetailsCreationObject, submitterUser, publisherConnectionObject
} from "../types/internal";
import { formattedMod, formattedMap, formattedPublisher } from "../types/frontend";
import { formatMod, getPublisherConnectionObject, getDifficultyArrays, getMapIDsCreationArray, param_userID, param_modID,
    param_mapID, param_modRevision, connectMapsToModDifficulties, formatMap, privilegedUser } from "../helperFunctions/maps-mods-publishers";
import { getCurrentTime } from "../helperFunctions/utils";


const publishersRouter = express.Router();




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




publishersRouter.route("/")
    .get(async function (_req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.route("/search")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("userID", async function (req, res, next) {
    try {
        await param_userID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/user/:userID")
    .get(async function (req, res, next) {
        try {

        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




publishersRouter.param("publisherID", async function (req, res, next) {
    try {

    }
    catch (error) {
        next(error);
    }
});


publishersRouter.route("/:publisherID")
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




publishersRouter.use(noRouteError);

publishersRouter.use(errorHandler);




export { publishersRouter };
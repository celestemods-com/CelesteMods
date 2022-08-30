import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { mapReviewPost } from "./mapReviews";
import { formatReview, formatReviews, param_reviewID } from "../helperFunctions/reviewCollections-reviews-mapReviews";
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


const router = express.Router();
export { router as reviewCollectionsRouter };





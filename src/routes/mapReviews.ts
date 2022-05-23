import express from "express";
import { prisma } from "../prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { reviews_maps } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
// import { createUserData, updateUserData } from "../types/internal";


const router = express.Router();
export { router as mapReviewsRouter };
import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";

//import { validatePost, validatePatch1, validatePatch2, validatePatch3 } from "../jsonSchemas/users";

import { reviews } from ".prisma/client";
// import { formattedUser, permissions } from "../types/frontend";
// import { createUserData, updateUserData } from "../types/internal";


const router = express.Router();
export { router as reviewsRouter };
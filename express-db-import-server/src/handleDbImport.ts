import express from "express";
import { prisma } from "./middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "./helperFunctions/errorHandling";


const router = express.Router();
export { router as handleImportRouter };




router.route("/")
    .post((req, res, next) => {
        
    })
    .all(methodNotAllowed);


router.use(noRouteError);

router.use(errorHandler);
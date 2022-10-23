import express from "express";
import fs from "fs"
import { prisma } from "./middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "./helperFunctions/errorHandling";


const router = express.Router();
export { router as handleImportRouter };




router.route("/")
    .post((req, res, next) => {
        try {
            console.log("writing JSON to file");

            fs.appendFileSync("./logs/db-import.json",`\n${JSON.stringify(req.body)}`);

            res.sendStatus(200);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.use(noRouteError);

router.use(errorHandler);
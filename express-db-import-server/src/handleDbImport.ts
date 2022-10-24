import express from "express";
import fs from "fs";

import { noRouteError, errorHandler, methodNotAllowed } from "./helperFunctions/errorHandling";
import { importDifficultiesAndTechs, importDiscordTags, importLengths, importPublishers } from "./helperFunctions/handleDbImport";
import { getCurrentTime } from "./helperFunctions/utils";

import { DbImportJSON } from "./types/handleDbImport";


const router = express.Router();
export { router as handleImportRouter };




router.route("/initial")
    .post(async (req, res, next) => {
        try {
            const responseObject: DbImportJSON = req.body();

            res.sendStatus(200);


            const currentTime = getCurrentTime();
            const { difficulties, subDifficulties, qualities, lengths, mods, publishers, discordTags, ratings } = responseObject;

            const { difficultyCreationObjects, techCreationObjects } = await importDifficultiesAndTechs(difficulties.reverse(), subDifficulties.reverse());
            const lengthCreationObjects = await importLengths(lengths.reverse());
            const userCreationObjects = await importDiscordTags(discordTags, currentTime);
            const publisherCreationObjects = await importPublishers(publishers);


            console.log("finished initial import");
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/to-file")
    .post((req, res, next) => {
        try {
            console.log("writing JSON to file");

            fs.appendFileSync("./logs/db-import.json", `\n${JSON.stringify(req.body)}`);

            res.sendStatus(200);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);
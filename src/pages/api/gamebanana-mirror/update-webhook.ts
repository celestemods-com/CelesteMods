import type { NextApiRequest, NextApiResponse } from "next";
import { writeFile, readFile } from "fs/promises";
import { parse } from "yaml";
import { serverLogger as logger } from "~/logger/serverLogger";
import { sendSuccessSignal } from "~/server/gamebananaMirror/sendSuccessSignal";
import { authenticateUpdateWebhookRequest } from "~/server/gamebananaMirror/authentication/authenticateUpdateWebhookRequest";




const MOD_SEARCH_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/mod_search_database.yaml";

const MOD_SEARCH_DATABASE_JSON_PATH = process.env.MOD_SEARCH_DATABASE_PATH || "./public/mod_search_database.json";

const MOD_SEARCH_DATABASE_FILE_ENCODING = "utf-8";


const FILE_SYSTEM_ERROR_STRING = "Failed to write the Mod Search Database to the file system.";


const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "https://gamebanana.com/dl/";

const FILE_CATEGORIES = ["mods", "screenshots", "richPresenceIcons"] as const satisfies string[];




export type ModSearchDatabase = Record<string, unknown>;




const isValidModSearchDatabase = (value: unknown): value is ModSearchDatabase => {
    return true;    //TODO!!!: Implement this
};




/** Updates the mod search database json file.
 * Also returns the parsed and validated object.
*/
const getNewModSearchDatabase = async (): Promise<ModSearchDatabase> => {
    logger.trace("Downloading the Mod Search Database.");


    const response = await fetch(MOD_SEARCH_DATABASE_YAML_URL);

    if (!response.ok) {
        throw `Failed to download the Mod Search Database. Status code: ${response.status}`;
    }

    logger.trace("Successfully downloaded the Mod Search Database.");


    const newYaml = await response.text();

    const parsedYaml: unknown = parse(newYaml);

    if (!isValidModSearchDatabase(parsedYaml)) {
        throw "The downloaded Mod Search Database failed validation.";
    }

    logger.trace("Successfully parsed the Mod Search Database.");


    try {
        await writeFile(MOD_SEARCH_DATABASE_JSON_PATH, JSON.stringify(parsedYaml), MOD_SEARCH_DATABASE_FILE_ENCODING);
    } catch (error) {
        logger.error(`${FILE_SYSTEM_ERROR_STRING} ${error}`);

        throw FILE_SYSTEM_ERROR_STRING;
    }


    return parsedYaml;
};




/** Updates the GameBanana mirror.
 * Returns the HTTP status code of the update.
*/
const updateGamebananaMirror = async (modSearchDatabase: ModSearchDatabase): Promise<number> => {
    //TODO!!!: Implement this
    //continue here
};




/** Downloads the new Mod Search Database before sending a response.
 * Sends a 200 status code if the download was successful.
 * Sends a 500 status code if the download was unsuccessful.
*/
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    logger.trace("GameBanana mirror update request received.");


    const authenticationStatusCode = await authenticateUpdateWebhookRequest(req);

    if (authenticationStatusCode !== 200) {
        res.status(authenticationStatusCode).end();

        return;
    }

    logger.info("Authentic GameBanana mirror update request received.");


    // Update the Mod Search Database
    let modSearchDatabase: ModSearchDatabase;

    try {
        modSearchDatabase = await getNewModSearchDatabase();
    } catch (error) {
        if (error !== FILE_SYSTEM_ERROR_STRING) {
            logger.error(error);
        }


        const errorMessage = typeof error === "string" ? error : "An unknown error occurred while updating the Mod Search Database.";


        res.status(500).json(errorMessage);

        return;
    }

    logger.info("The Mod Search Database has been updated.");


    res.status(202).end();


    // Update the GameBanana mirror
    const mirrorUpdateStatus = await updateGamebananaMirror(modSearchDatabase);

    if (mirrorUpdateStatus !== 200) {
        logger.error(`Failed to update the GameBanana mirror. Status code: ${mirrorUpdateStatus}`);

        return;
    }

    logger.info("Successfully updated the GameBanana mirror.");


    // Send a success signal
    await sendSuccessSignal(mirrorUpdateStatus);
};

export default handler;
import type { NextApiRequest, NextApiResponse } from "next";
import { writeFile, readFile } from "fs/promises";
import { parse } from "yaml";
import { serverLogger as logger } from "~/logger/serverLogger";




const MOD_SEARCH_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/mod_search_database.yaml";

const MOD_SEARCH_DATABASE_JSON_PATH = process.env.MOD_SEARCH_DATABASE_PATH || "./public/mod_search_database.json";

const MOD_SEARCH_DATABASE_FILE_ENCODING = "utf-8";


const FILE_SYSTEM_ERROR_STRING = "Failed to write the Mod Search Database to the file system.";




export type ModSearchDatabase = Record<string, unknown>;




const isValidModSearchDatabase = (value: unknown): value is ModSearchDatabase => {
    return true;    //TODO!!!: Implement this
};




/** This function returns HTTP status codes.
 * 200: The request is authenticated.
 * 401 or 403: The request is not authenticated.
 */
const authenticate = (req: NextApiRequest): number => {
    //TODO!!!: Implement this
    return 200;
}




/** Updates the mod search database json file.
 * Also returns the parsed and validated object.
*/
const getNewModSearchDatabase = async (): Promise<ModSearchDatabase> => {
    const response = await fetch(MOD_SEARCH_DATABASE_YAML_URL);

    if (!response.ok) {
        throw `Failed to download the Mod Search Database. Status code: ${response.status}`;
    }


    const newYaml = await response.text();

    const parsedYaml: unknown = parse(newYaml);

    if (!isValidModSearchDatabase(parsedYaml)) {
        throw "The downloaded Mod Search Database failed validation.";
    }


    try {
        await writeFile(MOD_SEARCH_DATABASE_JSON_PATH, JSON.stringify(parsedYaml), MOD_SEARCH_DATABASE_FILE_ENCODING);
    } catch (error) {
        logger.error(`${FILE_SYSTEM_ERROR_STRING} ${error}`);

        throw FILE_SYSTEM_ERROR_STRING;
    }


    return parsedYaml;
};




/** Downloads the new Mod Search Database before sending a response.
 * Sends a 200 status code if the download was successful.
 * Sends a 500 status code if the download was unsuccessful.
*/
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const authenticationStatusCode = authenticate(req);

    if (authenticationStatusCode !== 200) {
        res.status(authenticationStatusCode).end();

        return;
    }


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


    res.status(200).end();


    // Update the storage buckets
    //TODO!!!!: continue here
};

export default handler;
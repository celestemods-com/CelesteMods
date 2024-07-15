import type { NextApiRequest, NextApiResponse } from "next";
import { serverLogger as logger } from "~/logger/serverLogger";
import { sendSuccessSignal } from "~/server/gamebananaMirror/sendSuccessSignal";
import { authenticateUpdateWebhookRequest } from "~/server/gamebananaMirror/authentication/authenticateUpdateWebhookRequest";
import { modSearchDatabaseFileSystemErrorString, getUpdatedModSearchDatabase } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase";
import { FILE_CATEGORIES, type FileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";




const FILE_EXTENSIONS_BY_CATEGORY = {
    "mods": ".zip",
    "screenshots": ".png",
    "richPresenceIcons": ".png",
} as const satisfies {
    [Category in FileCategory]: string;
};




/** For each FileCategory, contains an array with the download URLs of all of the files that should now exist for that Category.
 * Each download URL must be a non-empty string. If the URL contains a file extension, it must match its Category.
 * Duplicate URLs are ignored.
 */
type Update_FileCategories = {
    [Category in FileCategory]: string[];
};


/** For each FileCategory, contains an array with the download URLs of all of the files that should now exist for that Category.
 * Each download URL must be a non-empty string. If the URL contains a file extension, it must match its Category.
 * Duplicate URLs are ignored.
 * isModSearchDatabaseUpdate may be omitted.
 */
type Update = {
    isModSearchDatabaseUpdate?: boolean;
} & Update_FileCategories;




const isValidFileExtension = <
    Category extends FileCategory,
>(fileExtension: string, fileCategory: Category): boolean => {
    const expectedFileExtension = FILE_EXTENSIONS_BY_CATEGORY[fileCategory];

    return fileExtension === expectedFileExtension;
};


const isValidDownloadUrl = <
    Category extends FileCategory,
>(
    value: unknown,
    fileCategory: Category,
): value is string => {
    if (typeof value !== "string") {
        return false;
    }


    const hasFileExtension = value.includes(".");

    if (!hasFileExtension) {
        return true;
    }

    const fileExtension = value.slice(value.lastIndexOf("."));


    return isValidFileExtension(fileExtension, fileCategory);
};


const isFileCategory = (value: string): value is FileCategory => FILE_CATEGORIES.includes(value as FileCategory);


const isUpdate = (value: unknown): value is Update => {
    if (typeof value !== "object" || value === null) {
        return false;
    }


    if ("isModSearchDatabaseUpdate" in value && typeof value.isModSearchDatabaseUpdate !== "boolean") {
        return false;
    }


    for (const [fileCategory, fileNames] of Object.entries(value)) {
        if (!isFileCategory(fileCategory)) {
            return false;
        }


        if (!Array.isArray(fileNames)) {
            return false;
        }

        for (const fileName of fileNames) {
            if (!isValidDownloadUrl(fileName, fileCategory)) {
                return false;
            }
        }
    }


    return true;
};




/** Updates the GameBanana mirror.
 * Returns the HTTP status code of the update.
*/
const updateGamebananaMirror = async (): Promise<number> => {
    logger.debug("Updating the GameBanana mirror.");

    return 200;

    //TODO!!!: Implement this
    // continue here
};




/** Downloads the new Everest Update Database and Mod Search Database before sending a response.
 * Sends a 200 status code if the download was successful.
 * Sends a 500 status code if the download was unsuccessful.
 * Sends 40X or 500 status codes if the authentication fails.
*/
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    logger.info("GameBanana mirror update request received.");


    // Validate the request method
    if (req.method !== "POST") {
        res.status(405).end();

        return;
    }

    logger.info("Request method validated.");


    // Authenticate the request
    const authenticationStatusCode = await authenticateUpdateWebhookRequest(req);

    if (authenticationStatusCode !== 200) {
        res.status(authenticationStatusCode).end();

        return;
    }

    logger.info("GameBanana mirror update request authenticated.");


    // Parse the request body
    const update: unknown = req.body;

    if (!isUpdate(update)) {
        res.status(400).json("Invalid request body.");

        return;
    }

    logger.info("Request body parsed.");


    // Update the Mod Search Database if requested
    if (update.isModSearchDatabaseUpdate) {
        logger.info("Updating the Mod Search Database.");

        try {
            await getUpdatedModSearchDatabase();
        } catch (error) {
            if (error !== modSearchDatabaseFileSystemErrorString) {
                logger.error(error);
            }


            const errorMessage = typeof error === "string" ? error : "An unknown error occurred while updating the Mod Search Database.";


            res.status(500).json(errorMessage);

            return;
        }


        logger.info("The Mod Search Database has been updated.");

        res.status(200).end();
    } else {
        logger.debug("The Mod Search Database does not need to be updated.");

        res.status(202).end();
    }


    // Update the GameBanana mirror
    const mirrorUpdateStatus = await updateGamebananaMirror();

    if (mirrorUpdateStatus !== 200) {
        logger.error(`Failed to update the GameBanana mirror. Status code: ${mirrorUpdateStatus}`);

        return;
    }

    logger.info("Successfully updated the GameBanana mirror.");


    // Send a success signal
    await sendSuccessSignal(mirrorUpdateStatus);
};

export default handler;
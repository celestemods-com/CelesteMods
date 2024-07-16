import type { NextApiRequest, NextApiResponse } from "next";
import { serverLogger as logger } from "~/logger/serverLogger";
import { authenticateUpdateWebhookRequest } from "~/server/gamebananaMirror/authentication/authenticateUpdateWebhookRequest";
import { getUpdatedModSearchDatabase } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase";
import { DELETE_BATCH_SIZE, FILE_CATEGORIES, isFileCategory, type FileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";
import { sendDownloadRequestToMirror, deleteFilesFromMirror } from "~/server/gamebananaMirror/cloudflareApi/httpHandlers";
import { getFileListForCategory } from "~/server/gamebananaMirror/cloudflareApi/getFileListForCategory";




/** File extensions MUST include the leading "." */
const FILE_EXTENSIONS_BY_CATEGORY = {
    "mods": ".zip",
    "screenshots": ".png",
    "richPresenceIcons": ".png",
} as const satisfies {
    [Category in FileCategory]: string;
};




/** For each FileCategory, contains an array with the download URLs of all of the files that should now exist for that Category.
 * Each download URL must be a non-empty string, and must not contain a trailing slash. If the URL contains a file extension, it must match its Category.
 * Duplicate URLs are ignored.
 */
type Update_FileCategories = {
    [Category in FileCategory]: string[];
};


/** For each FileCategory, contains an array with the download URLs of all of the files that should now exist for that Category.
 * Each download URL must be a non-empty string, and must not contain a trailing slash. If the URL contains a file extension, it must match its Category.
 * Duplicate URLs are ignored.
 * isModSearchDatabaseUpdate may be omitted.
 */
type Update = {
    isModSearchDatabaseUpdate?: boolean;
} & Update_FileCategories;




type FileInfo = {
    fileName: string;
    downloadUrl: string;
};




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




/** Returns a FileInfo array, or an HTTP status code if there was an error. */
const getFileInfoArrayFromDownloadUrls = (fileCategory: FileCategory, downloadUrls: string[]): FileInfo[] | number => {
    const validFileExtension = FILE_EXTENSIONS_BY_CATEGORY[fileCategory];


    // Extract the file names from the download URLs
    const fileInfoArray: FileInfo[] = [];

    for (const downloadUrl of downloadUrls) {
        let fileName = downloadUrl.slice(downloadUrl.lastIndexOf("/") + 1);

        if (fileName === "") {
            logger.trace(`Download URL has an empty file name: ${downloadUrl}`);

            return 422;
        }


        const hasFileExtension = fileName.includes(".");

        if (hasFileExtension) {
            const fileExtension = fileName.slice(fileName.lastIndexOf("."));

            if (!isValidFileExtension(fileExtension, fileCategory)) {
                logger.trace(`Download URL has an invalid file extension: ${downloadUrl}`);

                return 422;
            }
        } else {
            fileName += validFileExtension;
        }


        fileInfoArray.push({ fileName, downloadUrl });
    }


    return fileInfoArray;
};




/** Updates a single category of files on the Gamebanana mirror.
 * Assumes that files with the same name are the same file.
 * Returns the HTTP status code of the update.
 */
const updateFileCategory = async (fileCategory: FileCategory, downloadUrls: string[]): Promise<number> => {
    // Get the FileInfo array
    logger.debug(`Getting the FileInfo array for file category: ${fileCategory}`);

    const fileInfoArrayOrStatusCode = getFileInfoArrayFromDownloadUrls(fileCategory, downloadUrls);

    if (typeof fileInfoArrayOrStatusCode === "number") {
        logger.error(`Failed to generate fileInfoArray for file category: ${fileCategory}. Status code: ${fileInfoArrayOrStatusCode}`);

        return fileInfoArrayOrStatusCode;
    }

    logger.trace(`FileInfo array: ${JSON.stringify(fileInfoArrayOrStatusCode)}`);


    // Get the existing file names
    logger.debug(`Getting the existing file names for file category: ${fileCategory}`);

    const existingFileNamesOrStatusCode = await getFileListForCategory(fileCategory);

    if (typeof existingFileNamesOrStatusCode === "number") {
        logger.error(`Failed to get existing file names for file category: ${fileCategory}. Status code: ${existingFileNamesOrStatusCode}`);

        return existingFileNamesOrStatusCode;
    }

    logger.trace(`Existing file names: ${JSON.stringify(existingFileNamesOrStatusCode)}`);


    // Determine which files already exist (so don't need to be downloaded) and which files should be deleted
    logger.debug(`Comparing the existing files with the new files for file category: ${fileCategory}`);

    const filesToDelete: string[] = [];

    for (const existingFileName of existingFileNamesOrStatusCode) {
        const existingFileIndex = fileInfoArrayOrStatusCode.findIndex(fileInfo => fileInfo.fileName === existingFileName);

        if (existingFileIndex === -1) { // The file should be deleted
            filesToDelete.push(existingFileName);
        } else {    // The file already exists
            fileInfoArrayOrStatusCode.splice(existingFileIndex, 1);
        }
    }


    // Delete the files that should no longer exist
    logger.debug(`Deleting ${filesToDelete.length} files from the GameBanana mirror for file category: ${fileCategory}`);
    logger.trace(`Files to delete: ${JSON.stringify(filesToDelete)}`);

    const fileDeletionPromises: Promise<number>[] = [];

    for (let index = 0; index < filesToDelete.length; index += DELETE_BATCH_SIZE) {
        const fileNamesBatch = filesToDelete.slice(index, index + DELETE_BATCH_SIZE);

        if (fileNamesBatch.length === 0) {
            break;
        }


        const deletionPromise = deleteFilesFromMirror(fileCategory, fileNamesBatch as [string, ...string[]]);   // This is safe because the length is checked above

        fileDeletionPromises.push(deletionPromise);
    }


    // Download the new files
    logger.debug(`Downloading ${fileInfoArrayOrStatusCode.length} new files to the GameBanana mirror for file category: ${fileCategory}`);
    logger.trace(`Files to download: ${JSON.stringify(fileInfoArrayOrStatusCode)}`);

    const newFileDownloadPromises: Promise<number>[] = [];

    for (const fileInfo of fileInfoArrayOrStatusCode) {
        const downloadPromise = sendDownloadRequestToMirror(fileCategory, fileInfo.fileName, fileInfo.downloadUrl);

        newFileDownloadPromises.push(downloadPromise);
    }


    // Wait for all deletions and downloads to complete
    const deletionResults = await Promise.all(fileDeletionPromises);
    const downloadResults = await Promise.all(newFileDownloadPromises);

    logger.debug(`All deletions and downloads have completed for file category: ${fileCategory}`);
    logger.trace(`Deletion results: ${JSON.stringify(deletionResults)}`);
    logger.trace(`Download results: ${JSON.stringify(downloadResults)}`);


    // Check for any errors
    const allResults = [...deletionResults, ...downloadResults];

    const hasError = allResults.some(result => result !== 200);

    if (hasError) {
        logger.debug(`Failed to update the GameBanana mirror for file category: ${fileCategory}`);

        return 500;
    }


    logger.debug(`Successfully updated the GameBanana mirror for file category: ${fileCategory}`);

    return 200;
};




/** Updates the GameBanana mirror.
 * Assumes that files with the same name are the same file.
 * Returns the HTTP status code of the update.
*/
const updateGamebananaMirror = async (update: Update): Promise<number> => {
    const updatePromises: Promise<number>[] = [];


    logger.debug("Updating the GameBanana mirror.");

    for (const fileCategory of FILE_CATEGORIES) {
        const downloadUrls = update[fileCategory];

        const updatePromise = updateFileCategory(fileCategory, downloadUrls);

        updatePromises.push(updatePromise);
    }


    const updateResults = await Promise.all(updatePromises);

    logger.debug("All file categories have been updated.");


    const hasError = updateResults.some(result => result !== 200);

    if (hasError) {
        return 500;
    }


    return 200;
};




/** Downloads the new Everest Update Database and Mod Search Database before sending a response.
 * Assumes that files with the same name are the same file.
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
            let errorMessage: string;

            if (typeof error === "string") {
                errorMessage = error;   // Error strings are logged in the getUpdatedYaml function
            } else {
                logger.error(`Failed to update the Mod Search Database. ${error}`);

                errorMessage = "An unknown error occurred while updating the Mod Search Database.";
            }


            res.status(500).json(errorMessage);

            return;
        }


        logger.info("The Mod Search Database has been updated.");
    } else {
        logger.debug("The Mod Search Database does not need to be updated.");
    }


    // Update the GameBanana mirror
    const mirrorUpdateStatus = await updateGamebananaMirror(update);

    if (mirrorUpdateStatus === 200) {
        logger.info("Successfully updated the GameBanana mirror.");
    }   // The errors are logged in the httpHandler functions


    res.status(mirrorUpdateStatus).end();
};

export default handler;
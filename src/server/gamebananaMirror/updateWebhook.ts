import { type NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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
    timestamp: number;
} & Update_FileCategories;




type FileInfo = {
    fileName: string;
    downloadUrl: string;
};




const isValidFileExtension = <
    Category extends FileCategory,
>(fileExtension: string, fileCategory: Category): boolean => {
    const expectedFileExtension = FILE_EXTENSIONS_BY_CATEGORY[fileCategory];


    const isValid = fileExtension === expectedFileExtension;

    if (!isValid) logger.info(`Invalid file extension. Expected: ${expectedFileExtension}, actual: ${fileExtension}`);


    return isValid;
};


const isValidDownloadUrl = <
    Category extends FileCategory,
>(
    value: unknown,
    fileCategory: Category,
): value is string => {
    if (typeof value !== "string") {
        logger.info(`Invalid value: ${JSON.stringify(value)}`);

        return false;
    }


    const urlSlug = value.slice(value.lastIndexOf("/") + 1);

    if (urlSlug === "") {
        logger.info(`Download URL has an empty URL slug. value: ${value}, urlSlug: ${urlSlug}`);

        return false;
    }


    const hasFileExtension = urlSlug.includes(".");

    if (!hasFileExtension) {
        logger.debug(`Download URL does not contain a file extension. value: ${value}, urlSlug: ${urlSlug}`);

        return true;
    }

    const fileExtension = urlSlug.slice(urlSlug.lastIndexOf("."));


    return isValidFileExtension(fileExtension, fileCategory);
};


const isUpdate = (value: unknown): value is Update => {
    if (typeof value !== "object" || value === null) {
        logger.info(`Invalid value: ${JSON.stringify(value)}`);

        return false;
    }


    if ("timestamp" in value === false) {
        logger.info("Missing timestamp");
        
        return false;
    }


    for (const [key, property] of Object.entries(value)) {
        if (key === "isModSearchDatabaseUpdate") {
            if (typeof property !== "boolean") {
                logger.info(`Invalid isModSearchDatabaseUpdate: ${property}`);
                
                return false;
            }

            logger.info(`isModSearchDatabaseUpdate: ${property}`);
            
            continue;
        }


        if (key === "timestamp") {
            if (typeof property !== "number") {
                logger.info(`Invalid timestamp: ${property}`);
                
                return false;
            }

            logger.info(`timestamp: ${property}`);
            
            continue;
        }


        if (!isFileCategory(key)) {
            logger.info(`Invalid file category: ${key}`);
            
            return false;
        }

        if (!Array.isArray(property)) {
            logger.info(`Invalid property for file category. key: ${key}, property: ${property}`);
            
            return false;
        }

        for (const fileName of property) {
            if (!isValidDownloadUrl(fileName, key)) {
                logger.info(`Invalid download URL for file category. key: ${key}, fileName: ${fileName}`);
                
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
            logger.debug(`Download URL has an empty file name: ${downloadUrl}`);

            return 422;
        }


        const hasFileExtension = fileName.includes(".");

        if (hasFileExtension) {
            const fileExtension = fileName.slice(fileName.lastIndexOf("."));

            if (!isValidFileExtension(fileExtension, fileCategory)) {
                logger.debug(`Download URL has an invalid file extension: ${downloadUrl}`);

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

    logger.debug(`FileInfo array: ${JSON.stringify(fileInfoArrayOrStatusCode)}`);


    // Get the existing file names
    logger.debug(`Getting the existing file names for file category: ${fileCategory}`);

    const existingFileNamesOrStatusCode = await getFileListForCategory(fileCategory);

    if (typeof existingFileNamesOrStatusCode === "number") {
        logger.error(`Failed to get existing file names for file category: ${fileCategory}. Status code: ${existingFileNamesOrStatusCode}`);

        return existingFileNamesOrStatusCode;
    }

    logger.debug(`Existing file names: ${JSON.stringify(existingFileNamesOrStatusCode)}`);


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
        logger.info(`Deleting ${filesToDelete.length} files from the GameBanana mirror for file category: ${fileCategory}`);
        logger.debug(`Files to delete: ${JSON.stringify(filesToDelete)}`);

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
        logger.info(`Downloading ${fileInfoArrayOrStatusCode.length} new files to the GameBanana mirror for file category: ${fileCategory}`);
        logger.debug(`Files to download: ${JSON.stringify(fileInfoArrayOrStatusCode)}`);

    const newFileDownloadPromises: Promise<number>[] = [];

    for (const fileInfo of fileInfoArrayOrStatusCode) {
        const downloadPromise = sendDownloadRequestToMirror(fileCategory, fileInfo.fileName, fileInfo.downloadUrl);

        newFileDownloadPromises.push(downloadPromise);
    }


    // Wait for all deletions and downloads to complete
    const deletionResults = await Promise.all(fileDeletionPromises);
    const downloadResults = await Promise.all(newFileDownloadPromises);

        logger.debug(`All deletions and downloads have completed for file category: ${fileCategory}`);
        logger.debug(`Deletion results: ${JSON.stringify(deletionResults)}`);
        logger.debug(`Download results: ${JSON.stringify(downloadResults)}`);


    // Check for any errors
    const allResults = [...deletionResults, ...downloadResults];

    const hasError = allResults.some(result => result !== 200);

    if (hasError) {
        logger.warn(`Failed to update the GameBanana mirror for file category: ${fileCategory}`);

        return 500;
    }


    logger.info(`Successfully updated the GameBanana mirror for file category: ${fileCategory}`);

    return 200;
};




/** Updates the GameBanana mirror.
 * Assumes that files with the same name are the same file.
 * Returns the HTTP status code of the update.
*/
const updateGamebananaMirror = async (update: Update): Promise<number> => {
    const updatePromises: Promise<number>[] = [];


    logger.info("Updating the GameBanana mirror.");

    for (const fileCategory of FILE_CATEGORIES) {
        const downloadUrls = update[fileCategory];

        logger.debug(`Download URLs for ${fileCategory}: ${downloadUrls}`);

        
        const updatePromise = updateFileCategory(fileCategory, downloadUrls);

        updatePromises.push(updatePromise);
    }


    const updateResults = await Promise.all(updatePromises);

    logger.info("All file categories have been updated.");


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
export const updateWebhookHandler = async <
    IsUpdateWebhook extends boolean,
    IsAuthenticationTest extends (
        IsUpdateWebhook extends true ? false : boolean // If this is the actual update webhook, then this is not an authentication test
    ),
>(
    request: NextRequest,
    isUpdateWebhook: IsUpdateWebhook,
    isAuthenticationTest: IsAuthenticationTest,
): Promise<NextResponse> => {
    const isDev = process.env.NODE_ENV === "development";

    if (isUpdateWebhook || isDev) logger.info("GameBanana mirror update request received."); // Only log requests to the actual update webhook


    const requestBodyString = await request.text(); // most route handlers should use request.json(), but this one needs to handle the raw string

    if (typeof requestBodyString !== "string" || requestBodyString === "") {
        const errorMessage = "The request body was missing or otherwise unparsable.";

        logger.info(`${errorMessage} Request body: "${requestBodyString}"`);


        return new NextResponse(
            errorMessage,
            {
                status: 400,
            }
        );
    }


    let requestBodyObject: unknown;

    try {
        requestBodyObject = JSON.parse(requestBodyString);
    } catch (error) {
        const message = "The request body was not parsable.";

        logger.info(`${message} ${error}`);

        return new NextResponse(
            message,
            {
                status: 400,
            }
        );
    }

    if (typeof requestBodyObject !== "object" || requestBodyObject === null) {
        const message = "The request body was not a valid object.";

        logger.info(message);

        return new NextResponse(
            message,
            {
                status: 400,
            }
        );
    };


    const requestHeadersList = headers();


    // Authenticate the request
    if (isUpdateWebhook || isAuthenticationTest) {
        const authenticationStatusCode = await authenticateUpdateWebhookRequest(requestHeadersList, requestBodyString, requestBodyObject);

        if (authenticationStatusCode !== 200) {
            return new NextResponse(
                null,
                {
                    status: authenticationStatusCode,
                }
            );
        }


        // Early return for authentication tests
        if (isAuthenticationTest) {
            const message = "Authentication test passed.";

            logger.info(message);

            return new NextResponse(
                message,
                {
                    status: 200,
                }
            );
        }

        logger.info("GameBanana mirror update request authenticated."); // Don't need to check isUpdateWebhook because authentication tests will never reach this point
    } else if (isDev) {
        logger.info("Non-authentication test request received.");   // In production only log requests to the actual update webhook
    }


    // Parse the request body
    if (!isUpdate(requestBodyObject)) {
        logger.info(`Invalid request body: ${JSON.stringify(requestBodyObject)}`);
        
        return new NextResponse(
            "Invalid request body.",
            {
                status: 400,
            }
        );
    }


    const message = "Request body parsed.";

    if (isUpdateWebhook || isDev) logger.info(message);

    // Early return for non-authentication tests
    if (!isUpdateWebhook) {
        return new NextResponse(
            message,
            {
                status: 200,
            }
        );
    }


    // Update the Mod Search Database if requested
    if (requestBodyObject.isModSearchDatabaseUpdate) {
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


            return new NextResponse(
                errorMessage,
                {
                    status: 500,
                }
            );
        }


        logger.info("The Mod Search Database has been updated.");
    } else {
        logger.debug("The Mod Search Database does not need to be updated.");
    }


    // Update the GameBanana mirror
    const mirrorUpdateStatus = await updateGamebananaMirror(requestBodyObject);

    if (mirrorUpdateStatus === 200) {
        logger.info("Successfully updated the GameBanana mirror.");
    }   // The errors are logged in the httpHandler functions


    return new NextResponse(
        null,
        {
            status: mirrorUpdateStatus,
        }
    );
};
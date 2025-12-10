import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, type FileDownloadRequestBody, type FileUploadRequestBody, type FileDeletionRequestBody, GAMEBANANA_MIRROR_WORKER_URL } from "./constsAndTypes";
import { getStorageRequestSignature } from "../authentication/getStorageRequestSignature";
import { arrayBufferToBase64String } from "../arrayBufferProcessing/base64StringToArrayBuffer";




const MAX_REQUEST_BODY_SIZE_IN_LOG = 500;
const PURGE_STATUS_CODE_PREFIX = "Purge status code: ";




/** Returns an HTTP status code */
export const sendDownloadRequestToMirror = async (fileCategory: FileCategory, fileName: string, downloadUrl: string): Promise<number> => {
    const requestBody: FileDownloadRequestBody = {
        fileCategory,
        fileName,
        downloadUrl,
    };

    const requestBodyString = JSON.stringify(requestBody);


    const signature = await getStorageRequestSignature(requestBodyString);


    logger.debug(`Sending download URL to the GameBanana mirror: ${requestBodyString}`);

    const response = await fetch(GAMEBANANA_MIRROR_WORKER_URL, {
        method: "PUT",
        headers: {
            "Authorization": signature,
            "Content-Type": "application/json",
        },
        body: requestBodyString,
    });


    if (!response.ok) {
        const responseBody = await response.text();

        logger.error(`Failed to send download URL to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName, downloadUrl, status: response.status, body: responseBody.slice(0, MAX_REQUEST_BODY_SIZE_IN_LOG) })}`);

        return 500;
    }


    logger.debug(`Downloaded file to the GameBanana mirror via URL: ${fileName}`);

    return 200;
};




/** Returns an HTTP status code */
export const uploadFileToMirror = async (fileCategory: FileCategory, fileName: string, fileBuffer: ArrayBuffer): Promise<number> => {
    const encodedFile = arrayBufferToBase64String(fileBuffer);


    const requestBody: FileUploadRequestBody = {
        fileCategory,
        fileName,
        file: encodedFile,
    };

    const requestBodyString = JSON.stringify(requestBody);


    const signature = await getStorageRequestSignature(requestBodyString);


    logger.debug(`Uploading file to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName })}`);   // Do not log the file content

    const response = await fetch(GAMEBANANA_MIRROR_WORKER_URL, {
        method: "PUT",
        headers: {
            "Authorization": signature,
            "Content-Type": "application/json",
        },
        body: requestBodyString,
    });

    if (!response.ok) {
        logger.error(`Failed to upload file to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName, status: response.status, body: await response.text() })}`);

        return 500;
    }


    logger.debug(`Uploaded file to the GameBanana mirror: ${fileName}`);

    return 200;
};




/** Returns a tuple of HTTP status codes
 * `[deletionStatusCode, cachePurgeStatusCode]`
*/
export const deleteFilesFromMirror = async (fileCategory: FileCategory, fileNames: [string, ...string[]]): Promise<[number, number]> => {
    const requestBody: FileDeletionRequestBody = {
        fileCategory,
        fileNames: fileNames,
    };

    const requestBodyString = JSON.stringify(requestBody);


    const signature = await getStorageRequestSignature(requestBodyString);


    logger.debug(`Deleting files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames })}`);

    const response = await fetch(GAMEBANANA_MIRROR_WORKER_URL, {
        method: "DELETE",
        headers: {
            "Authorization": signature,
            "Content-Type": "application/json",
        },
        body: requestBodyString,
    });
    
    const responseBody = await response.text();

    if (!response.ok) {
        logger.error(`Failed to delete files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames, status: response.status, body: responseBody })}`);

        return [500, NaN];
    }

    logger.debug(`Deleted files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames })}`);


    let cachePurgeStatusCode = NaN;

    const cachePurgeStatusCodeString = responseBody.slice(responseBody.lastIndexOf(PURGE_STATUS_CODE_PREFIX) + PURGE_STATUS_CODE_PREFIX.length);
    
    cachePurgeStatusCode = Number(cachePurgeStatusCodeString);

    if (!cachePurgeStatusCodeString.length || Number.isNaN(cachePurgeStatusCode)) {
        logger.error(`Failed to parse cache purge status code from the GameBanana mirror response: ${JSON.stringify({ fileCategory, fileNames, responseBody })}`);
    } 
    

    return [200, cachePurgeStatusCode];
};
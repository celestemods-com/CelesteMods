import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, type FileDownloadRequestBody, type FileUploadRequestBody, type FileDeletionRequestBody, GAMEBANANA_MIRROR_WORKER_URL, DELETE_BATCH_SIZE } from "./constsAndTypes";
import { getStorageRequestSignature } from "../authentication/getStorageRequestSignature";
import { arrayBufferToBase64String } from "../arrayBufferProcessing/base64StringToArrayBuffer";




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
        logger.error(`Failed to send download URL to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName, downloadUrl, status: response.status })}`);

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
        logger.error(`Failed to upload file to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName, status: response.status })}`);

        return 500;
    }


    logger.debug(`Uploaded file to the GameBanana mirror: ${fileName}`);

    return 200;
};




/** Returns an HTTP status code */
export const deleteFilesFromMirror = async (fileCategory: FileCategory, fileNames: [string, ...string[]]): Promise<number> => {
    logger.debug(`Deleting files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames })}`);


    for (let index = 0; index < fileNames.length; index += DELETE_BATCH_SIZE) {
        const fileNamesBatch = fileNames.slice(index, index + DELETE_BATCH_SIZE);

        if (fileNamesBatch.length === 0) {
            break;
        }


        const requestBody: FileDeletionRequestBody = {
            fileCategory,
            fileNames: fileNamesBatch as [string, ...string[]], // This is safe because the length is checked above
        };

        const requestBodyString = JSON.stringify(requestBody);


        const signature = await getStorageRequestSignature(requestBodyString);


        logger.debug(`Deleting a batch of files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames: fileNamesBatch })}`);

        const response = await fetch(GAMEBANANA_MIRROR_WORKER_URL, {
            method: "DELETE",
            headers: {
                "Authorization": signature,
                "Content-Type": "application/json",
            },
            body: requestBodyString,
        });

        if (!response.ok) {
            logger.error(`Failed to delete a batch of files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames: fileNamesBatch, status: response.status })}`);

            return 500;
        }


        logger.trace(`Deleted a batch of files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames: fileNamesBatch })}`);
    }


    logger.debug(`Deleted files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames })}`);

    return 200;
};
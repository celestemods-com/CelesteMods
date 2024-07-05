import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, type FileDownloadRequestBody, type FileUploadRequestBody, type FileDeletionRequestBody, GAMEBANANA_MIRROR_WORKER_URL, DELETE_BATCH_SIZE } from "./constsAndTypes";
import { getStorageRequestSignature } from "../authentication/getStorageRequestSignature";
import { arrayBufferToBase64String } from "../arrayBufferProcessing/base64StringToArrayBuffer";




const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "https://gamebanana.com/dl/";




const getModDownloadUrl = (fileNameNoExtension: string): string => `${GAMEBANANA_MOD_DOWNLOAD_BASE_URL}${fileNameNoExtension}`;

const getFullFileName = (fileNameNoExtension: string, fileExtension: string): string => `${fileNameNoExtension}.${fileExtension}`;




export const sendDownloadUrlToMirror = async (fileCategory: FileCategory, fileNameNoExtension: string, fileExtension: string): Promise<void> => {
    const fullFileName = getFullFileName(fileNameNoExtension, fileExtension);


    let downloadUrl: string;

    switch (fileCategory) {
        case "mods": {
            downloadUrl = getModDownloadUrl(fileNameNoExtension);
            break;
        }
        case "screenshots": {
            //TODO!!!: Implement this
            throw "Not implemented";
        }
        case "richPresenceIcons": {
            //TODO!!!: Implement this
            throw "Not implemented";
        }
        default: {
            throw `Invalid file category: ${fileCategory}`;
        }
    };


    const requestBody: FileDownloadRequestBody = {
        fileCategory,
        fileName: fullFileName,
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
        throw `Failed to download file to the GameBanana mirror via URL. Status code: ${response.status}`;
    }

    logger.debug(`Downloaded file to the GameBanana mirror via URL: ${fullFileName}`);
};




export const uploadFileToMirror = async (
    fileCategory: FileCategory,
    fileNameNoExtension: string,
    fileExtension: string,
    fileBuffer: ArrayBuffer,
): Promise<void> => {
    const fullFileName = getFullFileName(fileNameNoExtension, fileExtension);

    const encodedFile = arrayBufferToBase64String(fileBuffer);


    const requestBody: FileUploadRequestBody = {
        fileCategory,
        fileName: fullFileName,
        file: encodedFile,
    };

    const requestBodyString = JSON.stringify(requestBody);


    const signature = await getStorageRequestSignature(requestBodyString);


    logger.debug(`Uploading file to the GameBanana mirror: ${JSON.stringify({ fileCategory, fileName: fullFileName })}`);   // Do not log the file content

    const response = await fetch(GAMEBANANA_MIRROR_WORKER_URL, {
        method: "PUT",
        headers: {
            "Authorization": signature,
            "Content-Type": "application/json",
        },
        body: requestBodyString,
    });

    if (!response.ok) {
        throw `Failed to upload file to the GameBanana mirror. Status code: ${response.status}`;
    }

    logger.debug(`Uploaded file to the GameBanana mirror: ${fullFileName}`);
};




export const deleteFilesFromMirror = async (fileCategory: FileCategory, fileNames: [string, ...string[]]): Promise<void> => {
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
            throw `Failed to delete a batch of files from the GameBanana mirror. Status code: ${response.status}`;
        }

        logger.trace(`Deleted a batch of files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames: fileNamesBatch })}`);
    }


    logger.debug(`Deleted files from the GameBanana mirror: ${JSON.stringify({ fileCategory, fileNames })}`);
};
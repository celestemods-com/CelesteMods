import { getGamebananaApiUrl } from "./getGamebananaApiUrl";
import { fetchWithAxios } from "../useFetch";
import { GAMEBANANA_API_ERROR_STRING, type GamebananaApiResponse } from "./typesAndConsts";
import type { CancelTokenSource } from "axios";
import type { NewestFileId } from "../globalContexts/modDownloadUrl";




type GamebananaFileMetadata = {
    "_idRow": string,
    "_sFile": string,
    "_nFilesize": number,
    "_sDescription": string,
    "_tsDateAdded": number,
    "_nDownloadCount": number,
    "_sAnalysisState": string,
    "_sDownloadUrl": string,
    "_sMd5Checksum": string,
    "_sClamAvResult": string,
    "_sAnalysisResult": string,
    "_bContainsExe": boolean;
};


const isGamebananaFileMetadata = (
    data: unknown
): data is GamebananaFileMetadata => {
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;


    if (
        typeof dataObject._idRow === "string" &&
        typeof dataObject._sFile === "string" &&
        typeof dataObject._nFilesize === "number" &&
        typeof dataObject._sDescription === "string" &&
        typeof dataObject._tsDateAdded === "number" &&
        typeof dataObject._nDownloadCount === "number" &&
        typeof dataObject._sAnalysisState === "string" &&
        typeof dataObject._sDownloadUrl === "string" &&
        typeof dataObject._sMd5Checksum === "string" &&
        typeof dataObject._sClamAvResult === "string" &&
        typeof dataObject._sAnalysisResult === "string" &&
        typeof dataObject._bContainsExe === "boolean"
    ) return true;


    return false;
};


const isGamebananaFilesObject = (data: unknown): data is Record<string, GamebananaFileMetadata> => {
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;


    for (const [key, value] of Object.entries(dataObject)) {
        if (typeof key !== "string" || !isGamebananaFileMetadata(value)) return false;
    }


    return true;
};




const GAMEBANANA_MOD_FILES_LIST_FIELD = "Files().aFiles()";


export const getNewestFileIdFromGameBanana = async (
    gamebananaModId: number,
    source: CancelTokenSource,
): Promise<NewestFileId | undefined> => {
    //get query url
    const DEFAULT_GAMEBANANA_API_URL_PROPS = {
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: GAMEBANANA_MOD_FILES_LIST_FIELD,
        returnKeys: true,
    } as const;

    const queryUrl = getGamebananaApiUrl(DEFAULT_GAMEBANANA_API_URL_PROPS);


    const data = await fetchWithAxios<GamebananaApiResponse<true, typeof GAMEBANANA_MOD_FILES_LIST_FIELD>>(queryUrl, source);


    let filesObject = data ? data[GAMEBANANA_MOD_FILES_LIST_FIELD] : undefined;

    if (filesObject) {
        if (!isGamebananaFilesObject(filesObject)) throw new Error(GAMEBANANA_API_ERROR_STRING);
    }
    else {
        return undefined;
    }


    let newestFileId = "";
    let newestFileDateAdded = 0;

    for (const [fileId, fileData] of Object.entries(filesObject)) {
        if (fileId === "") continue;
        
        if (fileData._tsDateAdded > newestFileDateAdded) {
            newestFileId = fileId;
            newestFileDateAdded = fileData._tsDateAdded;
        }
    }


    return newestFileId;
};
import { useEffect, useMemo, useState } from "react";
import { useFetch } from "~/hooks/useFetch";
import type { Mod } from "~/components/mods/types";




const GAMEBANANA_API_BASE_URL = "api.gamebanana.com/Core/Item/Data" as const;

const GAMEBANANA_API_ERROR_STRING = "GameBanana API not responding as expected." as const;


export const GAMEBANANA_OLYMPUS_ICON_URL = "https://images.gamebanana.com/img/ico/tools/60b506516b5dc.png";




type GamebananaModId = Mod["gamebananaModId"];


export type GamebananaApiResponse<
    ReturnKeys extends boolean,
    Key extends string = (
        ReturnKeys extends true ?
        string :
        never
    ),
    ReturnType = unknown,
> = (
        ReturnKeys extends true ?
        Record<Key, ReturnType> :
        ReturnType[]
    );




const GAMEBANANA_ITEM_TYPES = ["Mod"] as const;

export type GamebananaItemType = typeof GAMEBANANA_ITEM_TYPES[number];


const GAMEBANANA_MOD_FIELDS = [
    "date",
    "screenshots",
] as const;

const GAMEBANANA_ITEM_FIELDS: {
    [ItemType in GamebananaItemType]: readonly string[];
} = {
    Mod: GAMEBANANA_MOD_FIELDS,
};

type GamebananaItemFields<      //TODO!!!: make this work then continue below
    ItemType extends GamebananaItemType
> = typeof GAMEBANANA_ITEM_FIELDS[ItemType];

export const getGamebananaItemFields = <
    ItemType extends GamebananaItemType,
    Fields extends GamebananaItemFields<ItemType>,
>(
    itemType: ItemType,
    fields: Fields,
) => {
    //TODO!!: continue here after above is fixed
};


type GetGamebananaApiUrlProps<
    ReturnType extends boolean,
> = {
    itemType: GamebananaItemType;
    itemId: GamebananaModId | undefined;
    fields: string | string[];
    returnKeys?: ReturnType;
};


export const useGamebananaApiUrl = <
    ReturnType extends boolean
>(
    {
        itemType,
        itemId,
        fields,
        returnKeys = false as ReturnType,
    }: GetGamebananaApiUrlProps<ReturnType>,
) => {
    //get fieldsString
    const [fieldsString, setFieldsString] = useState<string>("");

    useEffect(() => {
        if (typeof fields === "string") setFieldsString(fields);
        else setFieldsString(fields.join(","));
    }, [fields]);


    //get query url
    const [queryUrl, setQueryUrl] = useState<string>("");

    useEffect(() => {
        const url = itemId === undefined ?
            "" :
            `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}`;

        setQueryUrl(url);
    }, [itemType, itemId, fieldsString, returnKeys]);


    return { queryUrl };
};




type GamebananaScreenshotData = {
    _nFilesize?: number;
    _sCaption?: string;
    _sFile: string;
    _sFile100?: string;
    _sFile220?: string;
    _sFile530?: string;
    _sFile800?: string;
    _sTicketId?: string;
};


const isGamebananaScreenshotData = (
    data: unknown
): data is GamebananaScreenshotData => {   //tried to create as assertion, but encountered weird ts error
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;


    if (
        (!dataObject._nFilesize || typeof dataObject._nFilesize === "number") &&
        (!dataObject._sCaption || typeof dataObject._sCaption === "string") &&
        typeof dataObject._sFile === "string" &&
        (!dataObject._sFile100 || typeof dataObject._sFile100 === "string") &&
        (!dataObject._sFile220 || typeof dataObject._sFile220 === "string") &&
        (!dataObject._sFile530 || typeof dataObject._sFile530 === "string") &&
        (!dataObject._sFile800 || typeof dataObject._sFile800 === "string") &&
        (!dataObject._sTicketId || typeof dataObject._sTicketId === "string")
    ) return true;


    return false;
};


const isGamebananaScreenshotDataArray = (data: unknown): data is GamebananaScreenshotData[] => {
    if (!Array.isArray(data)) return false;

    return data.every(isGamebananaScreenshotData);
};




type UseGamebananaModImageUrlsProps = {
    gamebananaModId: GamebananaModId | undefined;
};

type UseGamebananaModImageUrlsReturn = {
    imageUrls?: string[];
};


const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com/img/ss/mods/";

export const useGamebananaModImageUrls = (
    { gamebananaModId }: UseGamebananaModImageUrlsProps
): UseGamebananaModImageUrlsReturn => {
    //get query url
    const DEFAULT_GAMEBANANA_API_URL_PROPS = {
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "screenshots",
        returnKeys: true,
    } as const;

    const [gamebananaApiUrlProps, setGamebananaApiUrlProps] = useState<GetGamebananaApiUrlProps<boolean>>(DEFAULT_GAMEBANANA_API_URL_PROPS);

    useEffect(() => {
        setGamebananaApiUrlProps(DEFAULT_GAMEBANANA_API_URL_PROPS);
    }, [gamebananaModId]);

    const { queryUrl } = useGamebananaApiUrl(gamebananaApiUrlProps);


    const { data, isLoading, error } = useFetch<GamebananaApiResponse<true, "screenshots">>(queryUrl);    //TODO!: implement caching


    //get screenshotData
    const screenshotData = useMemo(() => {
        if (isLoading) return [];

        const dataJSON = data?.screenshots;

        if (dataJSON) {
            if (typeof dataJSON !== "string") throw new Error(GAMEBANANA_API_ERROR_STRING);

            const data: unknown = JSON.parse(dataJSON);

            if (!isGamebananaScreenshotDataArray(data)) throw new Error(GAMEBANANA_API_ERROR_STRING);

            return data;
        }
        else {
            return [];
        }
    }, [data, isLoading]);


    //get image urls
    const imageUrls = useMemo(() => {
        return screenshotData.map(
            ({ _sFile }) => `${GAMEBANANA_MOD_IMAGES_BASE_URL}${_sFile}`,
        );
    }, [screenshotData]);


    if (error) console.error(error);

    if (isLoading) return {};

    return { imageUrls };
};




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
    console.log(data);
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;


    for (const [key, value] of Object.entries(dataObject)) {
        if (typeof key !== "string" || !isGamebananaFileMetadata(value)) return false;
    }


    return true;
};




type UseGamebananaModDownloadUrlProps = {
    gamebananaModId: GamebananaModId | undefined;
};

type UseGamebananaModDownloadUrlReturn = {
    downloadUrl?: string;
};


const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "everest:https://gamebanana.com/mmdl/";

export const useGamebananaModDownloadUrl = (
    { gamebananaModId }: UseGamebananaModDownloadUrlProps
): UseGamebananaModDownloadUrlReturn => {
    //get query url
    const DEFAULT_GAMEBANANA_API_URL_PROPS = {
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "Files().aFiles()",
        returnKeys: true,
    } as const;

    const [gamebananaApiUrlProps, setGamebananaApiUrlProps] = useState<GetGamebananaApiUrlProps<boolean>>(DEFAULT_GAMEBANANA_API_URL_PROPS);

    useEffect(() => {
        setGamebananaApiUrlProps(DEFAULT_GAMEBANANA_API_URL_PROPS);
    }, [gamebananaModId]);

    const { queryUrl } = useGamebananaApiUrl(gamebananaApiUrlProps);


    const { data, isLoading, error } = useFetch<GamebananaApiResponse<true, "Files().aFiles()">>(queryUrl);    //TODO!: implement caching


    //get download url
    const downloadUrl = useMemo(() => {
        if (isLoading) return undefined;

        const filesObject = data ? data["Files().aFiles()"] : undefined;

        if (filesObject) {
            if (!isGamebananaFilesObject(filesObject)) throw new Error(GAMEBANANA_API_ERROR_STRING);
        }
        else {
            return undefined;
        }


        let newestFileId = "";
        let newestFileDateAdded = 0;

        for (const [fileId, fileData] of Object.entries(filesObject)) {
            if (fileData._tsDateAdded > newestFileDateAdded) {
                newestFileId = fileId;
                newestFileDateAdded = fileData._tsDateAdded;
            }
        }

        return (
            newestFileId === "" ?
                "" :
                `${GAMEBANANA_MOD_DOWNLOAD_BASE_URL}${newestFileId},Mod,${gamebananaModId}`
        );
    }, [data, isLoading]);


    if (error) console.error(error);

    if (isLoading) return {};

    return { downloadUrl };
};
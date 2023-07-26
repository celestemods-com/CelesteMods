import { useEffect, useState } from "react";
import useFetch from "react-fetch-hook";




const GAMEBANANA_API_BASE_URL = "https://api.gamebanana.com/Core/Item/Data";

const GAMEBANANA_API_ERROR_STRING = "GameBanana API not responding as expected.";




export type GamebananaApiResponse<
    ReturnKeys extends boolean,
    Key extends string = (
        ReturnKeys extends true ?
        string :
        never
    ),
> = (
        ReturnKeys extends true ?
        Record<Key, string> :
        string[]
    );




const GAMEBANANA_ITEM_TYPES = ["Mod"] as const;

export type GamebananaItemType = typeof GAMEBANANA_ITEM_TYPES[number];


const GAMEBANANA_MOD_FIELDS = [
    "date",
    "screenshot",
] as const;

const GAMEBANANA_ITEM_FIELDS: {
    [ItemType in GamebananaItemType]: readonly string[];
} = {
    Mod: GAMEBANANA_MOD_FIELDS,
};

type GamebananaItemFields<      //TODO!!!: make this work then continue below
    ItemType extends GamebananaItemType
> = typeof GAMEBANANA_ITEM_FIELDS[ItemType];

type t = GamebananaItemFields<"Mod">;

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
    ReturnType extends boolean
> = {
    itemType: GamebananaItemType;
    itemId: number;
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
    const fieldsString = typeof fields === "string" ? fields : fields.join(",");


    return `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}}`;
};




type GamebananaScreenshotData = {
    _nFilesize: number;
    _sCaption: string;
    _sFile: string;
    _sFile100: string;
    _sFile220?: string;
    _sFile530?: string;
    _sFile800?: string;
    _sTicketId: string;
};


const isGamebananaScreenshotData = (data: unknown): data is GamebananaScreenshotData => {   //tried to create as assertion, but encountered weird ts error
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;


    if (
        typeof dataObject._nFilesize === "number" &&
        typeof dataObject._sCaption === "string" &&
        typeof dataObject._sFile === "string" &&
        typeof dataObject._sFile100 === "string" &&
        (!dataObject._sFile220 || typeof dataObject._sFile220 === "string") &&
        (!dataObject._sFile530 || typeof dataObject._sFile530 === "string") &&
        (!dataObject._sFile800 || typeof dataObject._sFile800 === "string") &&
        typeof dataObject._sTicketId === "string"
    ) return false;


    return true;
};


const isGamebananaScreenshotDataArray = (data: unknown): data is GamebananaScreenshotData[] => {
    if (!Array.isArray(data)) return false;

    return data.every(isGamebananaScreenshotData);
};




type UseGamebananaModImageUrlsProps = {
    gamebananaModId: number | undefined;
};


const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com/img/ss/mods/";


export const useGamebananaModImageUrls = ({ gamebananaModId }: UseGamebananaModImageUrlsProps): string[] => {
    if (!gamebananaModId) return [];


    //get query url
    const queryUrl = useGamebananaApiUrl({
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "date",
        returnKeys: true,
    });


    //get screenshotData
    const [screenshotData, setScreenshotData] = useState<GamebananaScreenshotData[]>([]);

    const screenshotDataQuery = useFetch<GamebananaApiResponse<true, "screenshot">>(queryUrl, { depends: [gamebananaModId] });    //TODO!: implement caching

    useEffect(() => {
        if (screenshotDataQuery.isLoading) return;

        const dataJSON = screenshotDataQuery.data?.screenshot;

        if (dataJSON) {
            const data: unknown = JSON.parse(dataJSON);

            if (!isGamebananaScreenshotDataArray(data)) throw GAMEBANANA_API_ERROR_STRING;

            setScreenshotData(data);
        }
    }, [screenshotDataQuery.data]);


    //get image urls
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    useEffect(() => {
        if (!screenshotData) return;

        const imageUrls: string[] = screenshotData.map(
            ({ _sFile }) => `${GAMEBANANA_MOD_IMAGES_BASE_URL}${_sFile}`,
        );

        setImageUrls(imageUrls);
    }, [screenshotData]);


    return imageUrls;
};
import { useEffect, useMemo, useState } from "react";
import type { GamebananaModId } from "~/components/mods/types";
import { type GetGamebananaApiUrlProps, useGamebananaApiUrl, getGamebananaApiUrl } from "./useGamebananaApiUrl";
import { fetchWithAxios, useFetch } from "../useFetch";
import { GAMEBANANA_API_ERROR_STRING, type GamebananaApiResponse } from "./typesAndConsts";
import type { CancelTokenSource } from "axios";




/** Contains other properties, but we don't use them so they aren't specified or checked. */
type GamebananaScreenshotData = {
    _sFile: string;
};


const isGamebananaScreenshotData = (
    data: unknown
): data is GamebananaScreenshotData => {   //tried to create as assertion, but encountered weird ts error
    if (typeof data !== "object" || data === null) return false;

    const dataObject = data as Record<string, unknown>;

    if (typeof dataObject._sFile === "string") return true;

    return false;
};


const isGamebananaScreenshotDataArray = (data: unknown): data is GamebananaScreenshotData[] => {
    if (!Array.isArray(data)) return false;

    return data.every(isGamebananaScreenshotData);
};




export type ModImageUrls = string[];


const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com/img/ss/mods/";




type UseGamebananaModImageUrlsProps = {
    gamebananaModId: GamebananaModId | undefined;
};

type UseGamebananaModImageUrlsReturn = {
    imageUrls?: ModImageUrls;
};


// Unused

export const useGamebananaModImageUrls = (
    { gamebananaModId }: UseGamebananaModImageUrlsProps
): UseGamebananaModImageUrlsReturn => {
    if (gamebananaModId === undefined) return {};


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
        const imageUrls = screenshotData.map(
            ({ _sFile }) => `${GAMEBANANA_MOD_IMAGES_BASE_URL}${_sFile}`,
        );


        return imageUrls;
    }, [screenshotData]);


    if (error) console.error(error);

    if (isLoading) return {};

    return { imageUrls };
};




export const getModImageUrls = async (
    gamebananaModId: number,
    source: CancelTokenSource,
): Promise<ModImageUrls> => {
    // get query url
    const DEFAULT_GAMEBANANA_API_URL_PROPS = {
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "screenshots",
        returnKeys: true,
    } as const;


    const queryUrl = getGamebananaApiUrl(DEFAULT_GAMEBANANA_API_URL_PROPS);


    const data = await fetchWithAxios<GamebananaApiResponse<true, "screenshots">>(queryUrl, source);


    // get screenshotData
    const dataJSON = data?.screenshots;

    if (!dataJSON || typeof dataJSON !== "string") throw new Error(GAMEBANANA_API_ERROR_STRING);


    const screenshotsData: unknown = JSON.parse(dataJSON);

    if (!isGamebananaScreenshotDataArray(screenshotsData)) throw new Error(GAMEBANANA_API_ERROR_STRING);


    const imageUrls = screenshotsData.map(
        ({ _sFile }) => `${GAMEBANANA_MOD_IMAGES_BASE_URL}${_sFile}`,
    );


    return imageUrls;
};
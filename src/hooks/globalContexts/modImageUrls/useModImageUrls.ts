"use client";

import axios from 'axios';
import { useEffect, useState, useContext } from "react";
import { getModImageUrlsFromGameBanana } from "~/hooks/gamebananaApi/getModImageUrlsFromGameBanana";
import type { ModImageUrls } from "./constsAndTypes";
import { modImageUrlsContext } from "./modImageUrlsContext";




type useModImageUrlsProps = {
    gamebananaModId: number,
    screenshotsFromModSearchDatabase: ModImageUrls | undefined,
};


export const useModImageUrls = (
    {
        gamebananaModId,
        screenshotsFromModSearchDatabase,
    }: useModImageUrlsProps,
): ModImageUrls => {
    const contextOrUndefined = useContext(modImageUrlsContext);

    const cachedImageUrls = contextOrUndefined?.state[gamebananaModId];

    const [imageUrls, setImageUrls] = useState<ModImageUrls>(cachedImageUrls ?? []);


    useEffect(() => {
        if (cachedImageUrls) return;

        if (contextOrUndefined === undefined) throw "useModImageUrlContext must be used within a ModImageUrlsContextProvider";


        if (screenshotsFromModSearchDatabase !== undefined && screenshotsFromModSearchDatabase.length > 0) {
            setImageUrls(screenshotsFromModSearchDatabase);

            contextOrUndefined.update(
                (previousState) => ({
                    ...previousState,
                    [gamebananaModId]: screenshotsFromModSearchDatabase,
                })
            );

            return;
        }


        const source = axios.CancelToken.source();

        const fetchImageUrls = async () => {
            let fetchedImageUrls: ModImageUrls;

            try {
                fetchedImageUrls = await getModImageUrlsFromGameBanana(gamebananaModId, source);
            }
            catch (error) {
                console.warn(`Failed to fetch image urls for mod ${gamebananaModId}.`);
                console.error(error);

                return;
            }

            if (fetchedImageUrls.length === 0) return;


            setImageUrls(fetchedImageUrls);

            contextOrUndefined.update(
                (previousState) => ({
                    ...previousState,
                    [gamebananaModId]: fetchedImageUrls,
                })
            );
        };

        fetchImageUrls();


        return () => {
            source.cancel();
        };
    }, [gamebananaModId, screenshotsFromModSearchDatabase, contextOrUndefined, cachedImageUrls]);


    return imageUrls;
};
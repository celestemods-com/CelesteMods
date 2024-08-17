import { createContext, useEffect, useMemo, useState, useContext } from "react";
import type { ContextState } from "./globalContextsProvider";
import { getModImageUrlsFromGameBanana } from "~/hooks/gamebananaApi/getModImageUrlsFromGameBanana";
import type { GamebananaModId } from "~/components/mods/types";
import axios from 'axios';




export type ModImageUrls = string[];


export type ModImageUrlsState = Record<GamebananaModId, ModImageUrls>;




const modImageUrlsContext = createContext<ContextState<ModImageUrlsState> | undefined>(undefined);


export const ModImageUrlsContextProvider = ({ children }: { children: React.ReactNode; }) => {
    const [modImageUrls, setModImageUrls] = useState<ModImageUrlsState>({});


    const modImageUrlsStateRecord = useMemo(
        () => ({
            state: modImageUrls,
            update: setModImageUrls,
        }),
        [modImageUrls],
    );


    return (
        <modImageUrlsContext.Provider value={modImageUrlsStateRecord}>
            {children}
        </modImageUrlsContext.Provider>
    );
};




export const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com";


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
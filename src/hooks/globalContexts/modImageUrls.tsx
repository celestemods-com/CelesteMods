import { createContext, useEffect, useMemo, useState, useContext } from "react";
import type { ContextState } from "./globalContextsProvider";
import { getModImageUrls } from "~/hooks/gamebananaApi/getModImageUrls";
import type { GamebananaModId } from "~/components/mods/types";
import type { ModImageUrls } from "~/hooks/gamebananaApi/getModImageUrls";
import axios from 'axios';




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




type useModImageUrlsProps = {
    gamebananaModId: number,
};


export const useModImageUrls = (
    {
        gamebananaModId,
    }: useModImageUrlsProps,
): ModImageUrls => {
    const contextOrUndefined = useContext(modImageUrlsContext);

    const cachedImageUrls = contextOrUndefined?.state[gamebananaModId];

    const [imageUrls, setImageUrls] = useState<ModImageUrls>(cachedImageUrls ?? []);


    useEffect(() => {
        if (cachedImageUrls) return;

        if (contextOrUndefined === undefined) throw "useModImageUrlContext must be used within a ModImageUrlsContextProvider";


        const source = axios.CancelToken.source();


        const fetchImageUrls = async () => {
            let fetchedImageUrls: ModImageUrls;

            try {
                fetchedImageUrls = await getModImageUrls(gamebananaModId, source);
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
    }, [gamebananaModId, contextOrUndefined, cachedImageUrls]);


    return imageUrls;
};
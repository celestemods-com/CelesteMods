import { createContext, useEffect, useMemo, useState, useContext } from "react";
import type { ContextState } from "./globalContextsProvider";
import { getGamebananaModImageUrls } from "~/hooks/gamebananaApi";
import type { GamebananaModId } from "~/components/mods/types";
import axios, { type CancelTokenSource } from 'axios';




type ModImageUrls = string[];

export type ModImageUrlsState = Record<GamebananaModId, ModImageUrls>;


type useModImageUrlsProps = {
    gamebananaModId: number,
};




const modImageUrlsContext = createContext<ContextState<ModImageUrlsState> | null>(null);




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




export const useModImageUrlsContext = (
    {
        gamebananaModId,
    }: useModImageUrlsProps,
): ModImageUrls => {
    const contextOrNull = useContext(modImageUrlsContext);

    const cachedImageUrls = contextOrNull?.state[gamebananaModId];

    const [imageUrls, setImageUrls] = useState<ModImageUrls>(cachedImageUrls ?? []);


    useEffect(() => {
        if (cachedImageUrls) return;

        if (contextOrNull === null) throw "useModImageUrlsContext may only be called within a descendant of a ModImageUrlsContextProvider component";


        const source = axios.CancelToken.source();


        const fetchImageUrls = async () => {
            const fetchedImageUrls = await getGamebananaModImageUrls(gamebananaModId, source);

            setImageUrls(fetchedImageUrls);

            contextOrNull.update({
                ...contextOrNull.state,
                [gamebananaModId]: fetchedImageUrls,
            });
        };

        fetchImageUrls();


        return () => {
            source.cancel();
        };
    }, [gamebananaModId, contextOrNull, cachedImageUrls]);


    return imageUrls;
};
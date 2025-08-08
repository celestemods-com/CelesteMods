import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ContextState } from "./globalContextsProvider";
import { getModDownloadUrl } from "../gamebananaApi/getModDownloadUrl";
import type { GamebananaModId } from "~/components/mods/types";
import type { ModDownloadurl } from "../gamebananaApi/getModDownloadUrl";
import axios from "axios";
import { GAMEBANANA_MOD_BASE_URL } from "~/consts/gamebananaModBaseUrl";




type ModDownloadUrlState = {
	url: string;
	isFallback: boolean;
};


export type ModDownloadUrlsContextState = Record<GamebananaModId, ModDownloadUrlState>;




const modDownloadUrlContext = createContext<ContextState<ModDownloadUrlsContextState> | undefined>(undefined);


export const ModDownloadUrlsContextProvider = ({ children }: { children: React.ReactNode; }) => {
    const [modDownloadUrls, setModDownloadUrls] = useState<ModDownloadUrlsContextState>({});


    const modDownloadUrlsState = useMemo(
        () => ({
            state: modDownloadUrls,
            update: setModDownloadUrls,
        }),
        [modDownloadUrls],
    );


    return (
        <modDownloadUrlContext.Provider value={modDownloadUrlsState}>
            {children}
        </modDownloadUrlContext.Provider>
    );
};




type useModDownloadUrlProps = {
    gamebananaModId: number,
};


export const useModDownloadUrl = (
    {
        gamebananaModId,
    }: useModDownloadUrlProps,
): string => {
	const fallbackUrl = `${GAMEBANANA_MOD_BASE_URL}/${gamebananaModId}`;


    const contextOrUndefined = useContext(modDownloadUrlContext);


    const cachedDownloadUrlState = contextOrUndefined?.state[gamebananaModId];

	const { url: cachedDownloadUrl, isFallback: cachedUrlIsFallback } = cachedDownloadUrlState ?? { url: "", isFallback: false };


    const [downloadUrl, setDownloadUrl] = useState<string>(cachedDownloadUrl);


    useEffect(() => {
        if (cachedDownloadUrl && !cachedUrlIsFallback) return;

        if (contextOrUndefined === undefined) throw "useModDownloadUrl must be used within a ModDownloadUrlsContextProvider";


        const source = axios.CancelToken.source();


        const fetchDownloadUrl = async () => {
            let fetchedDownloadUrl: ModDownloadurl;
			let fetchFailed = false;

            try {
                fetchedDownloadUrl = await getModDownloadUrl(gamebananaModId, source);
            }
            catch (error) {
                console.warn(`Failed to fetch download url for mod ${gamebananaModId}.`);
                console.error(error);

				fetchedDownloadUrl = fallbackUrl;
				fetchFailed = true;
            }

            if (fetchedDownloadUrl === undefined) return;
            

            setDownloadUrl(fetchedDownloadUrl);

            contextOrUndefined.update(
                (previousState) => ({
                    ...previousState,
					[gamebananaModId]: {
						url: fetchedDownloadUrl,
						isFallback: fetchFailed,
					},
                })
            );
        };

        fetchDownloadUrl();


        return () => {
            source.cancel();
        };
    }, [gamebananaModId, fallbackUrl, cachedDownloadUrl, cachedUrlIsFallback, contextOrUndefined]);


    return downloadUrl;
};
import { createContext, useMemo, useState } from "react";
import { ContextState } from "./globalContextsProvider";
import type { GamebananaModId } from "~/components/mods/types";




export type ModDownloadUrls = Record<GamebananaModId, string>;




export const modDownloadUrlsContext = createContext<ContextState<ModDownloadUrls> | null>(null);




export const ModDownloadUrlsContextProvider = ({children}: {children: React.ReactNode}) => {
    const [modDownloadUrls, setModDownloadUrls] = useState<ModDownloadUrls>({});

    const modDownloadUrlsState = useMemo(
        () => ({
            state: modDownloadUrls,
            update: setModDownloadUrls,
        }),
        [modDownloadUrls],
    );


    return (
        <modDownloadUrlsContext.Provider value={modDownloadUrlsState}>
            {children}
        </modDownloadUrlsContext.Provider>
    )
};
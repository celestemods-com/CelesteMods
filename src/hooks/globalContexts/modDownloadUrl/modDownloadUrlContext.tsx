import { createContext, useMemo, useState } from "react";
import { ContextState } from "../globalContextsProvider";
import type { GamebananaModId } from "~/components/mods/types";




type ModDownloadUrlState = Record<GamebananaModId, string>;




export const modDownloadUrlContext = createContext<ContextState<ModDownloadUrlState> | undefined>(undefined);


export const ModDownloadUrlsContextProvider = ({ children }: { children: React.ReactNode; }) => {
    const [modDownloadUrls, setModDownloadUrls] = useState<ModDownloadUrlState>({});


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
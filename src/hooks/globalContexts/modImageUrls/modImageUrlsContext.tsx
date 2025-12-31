import { createContext, useMemo, useState } from "react";
import type { ContextState } from "../globalContextsProvider";
import type { ModImageUrls } from "./constsAndTypes";
import type { GamebananaModId } from "~/components/mods/types";




type ModImageUrlsState = Record<GamebananaModId, ModImageUrls>;




export const modImageUrlsContext = createContext<ContextState<ModImageUrlsState> | undefined>(undefined);


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
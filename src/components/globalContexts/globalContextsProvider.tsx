import { type Dispatch, type SetStateAction, useState, useMemo } from "react";
import { type ModImageUrls, modImageUrlsContext } from "./modImageUrls";
import { type ModDownloadUrls, modDownloadUrlsContext } from "./modDownloadUrls";




export type StateObject<T> = {
    state: T,
    update: Dispatch<SetStateAction<T>>;
};



export const GlobalContextsProvider = ({ children }: { children: React.ReactNode; }) => {
    const [modImageUrls, setModImageUrls] = useState<ModImageUrls>({});

    const modImageUrlsStateRecord = useMemo(
        () => ({
            state: modImageUrls,
            update: setModImageUrls,
        }),
        [modImageUrls],
    );


    const [modDownloadUrls, setModDownloadUrls] = useState<ModDownloadUrls>({});

    const modDownloadUrlsState = useMemo(
        () => ({
            state: modDownloadUrls,
            update: setModDownloadUrls,
        }),
        [modDownloadUrls],
    );


    return (
        <modImageUrlsContext.Provider value={modImageUrlsStateRecord}>
            <modDownloadUrlsContext.Provider value={modDownloadUrlsState}>
                {children}
            </modDownloadUrlsContext.Provider>
        </modImageUrlsContext.Provider>
    );
};
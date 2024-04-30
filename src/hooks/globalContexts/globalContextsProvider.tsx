import type { Dispatch, SetStateAction } from "react";
import { ModImageUrlsContextProvider } from "./modImageUrls";
import { ModDownloadUrlsContextProvider } from "./modDownloadUrls";




export type ContextState<T> = {
    state: T,
    update: Dispatch<SetStateAction<T>>;
};




export const GlobalContextsProvider = ({ children }: { children: React.ReactNode; }) => (
    <ModImageUrlsContextProvider>
        <ModDownloadUrlsContextProvider>
            {children}
        </ModDownloadUrlsContextProvider>
    </ModImageUrlsContextProvider>
);
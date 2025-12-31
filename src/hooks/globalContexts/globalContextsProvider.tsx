import type { Dispatch, SetStateAction } from "react";
import { ModImageUrlsContextProvider } from "./modImageUrls/modImageUrlsContext";
import { ModDownloadUrlsContextProvider } from "./modDownloadUrl/modDownloadUrlContext";




export type ContextState<State> = {
    state: State,
    update: Dispatch<SetStateAction<State>>;
};




export const GlobalContextsProvider = ({ children }: { children: React.ReactNode; }) => (
    <ModImageUrlsContextProvider>
        <ModDownloadUrlsContextProvider>
            {children}
        </ModDownloadUrlsContextProvider>
    </ModImageUrlsContextProvider>
);
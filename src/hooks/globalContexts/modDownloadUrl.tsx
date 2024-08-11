import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ContextState } from "./globalContextsProvider";
import { getNewestFileIdFromGameBanana } from "../gamebananaApi/getNewestFileIdFromGameBanana";
import type { GamebananaModId } from "~/components/mods/types";
import axios from "axios";
import { getNewestFileIdFromModSearchDatabaseModFiles, type ModSearchDatabase_ModInfo_File } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase";




export type ModDownloadUrlState = Record<GamebananaModId, string>;




const modDownloadUrlContext = createContext<ContextState<ModDownloadUrlState> | undefined>(undefined);


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




export type NewestFileId = string;


const GAMEBANANA_MOD_DOWNLOAD_BASE_URL = "everest:https://gamebanana.com/mmdl/";


const getModDownloadUrl = (
    gamebananaModId: number,
    newestFileId: NewestFileId,
) => {
    const downloadUrl = newestFileId === "" ? "" : `${GAMEBANANA_MOD_DOWNLOAD_BASE_URL}${newestFileId},Mod,${gamebananaModId}`;

    return downloadUrl;
};




export type UseModDownloadUrlProps = {
    gamebananaModId: number,
    filesFromModSearchDatabase: ModSearchDatabase_ModInfo_File[] | undefined,
};


export const useModDownloadUrl = (
    {
        gamebananaModId,
        filesFromModSearchDatabase,
    }: UseModDownloadUrlProps,
): string => {
    const contextOrUndefined = useContext(modDownloadUrlContext);

    const cachedDownloadUrl = contextOrUndefined?.state[gamebananaModId];

    const [downloadUrl, setDownloadUrl] = useState<string>(cachedDownloadUrl ?? "");


    useEffect(() => {
        if (cachedDownloadUrl) return;

        if (contextOrUndefined === undefined) throw "useModDownloadUrl must be used within a ModDownloadUrlsContextProvider";


        if (filesFromModSearchDatabase !== undefined) {
            const newestFileId = getNewestFileIdFromModSearchDatabaseModFiles(filesFromModSearchDatabase);

            if (newestFileId) {
                const downloadUrl = getModDownloadUrl(gamebananaModId, newestFileId);

                setDownloadUrl(downloadUrl);

                contextOrUndefined.update(
                    (previousState) => ({
                        ...previousState,
                        [gamebananaModId]: downloadUrl,
                    })
                );
                
                return;
            }
        }


        const source = axios.CancelToken.source();

        const fetchDownloadUrl = async () => {
            let newestFileId: NewestFileId | undefined;

            try {
                newestFileId = await getNewestFileIdFromGameBanana(gamebananaModId, source);
            }
            catch (error) {
                console.warn(`Failed to fetch download url for mod ${gamebananaModId}.`);
                console.error(error);

                return;
            }

            if (newestFileId === undefined) return;


            const downloadUrl = getModDownloadUrl(gamebananaModId, newestFileId);

            setDownloadUrl(downloadUrl);

            contextOrUndefined.update(
                (previousState) => ({
                    ...previousState,
                    [gamebananaModId]: downloadUrl,
                })
            );
        };

        fetchDownloadUrl();


        return () => {
            source.cancel();
        };
    }, [gamebananaModId, filesFromModSearchDatabase, contextOrUndefined, cachedDownloadUrl]);


    return downloadUrl;
};
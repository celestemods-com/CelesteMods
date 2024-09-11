import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { getNewestFileIdFromGameBanana } from "../../gamebananaApi/getNewestFileIdFromGameBanana";
import type { ModSearchDatabase_ModInfo_File } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase/constAndTypes";
import { GAMEBANANA_MOD_DOWNLOAD_BASE_URL, type NewestFileId } from "./constAndTypes";
import { modDownloadUrlContext } from "./modDownloadUrlContext";
import { getNewestFileIdFromModSearchDatabaseModFiles } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase/getNewestFileIdFromModSearchDatabaseModFiles";




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
import type { NewestFileId } from "~/hooks/globalContexts/modDownloadUrl/constAndTypes";
import { MOD_SEARCH_DATABASE_FILE_URL_PREFIX, type ModSearchDatabase_ModInfo_File } from "./constAndTypes";





export const getNewestFileIdFromModSearchDatabaseModFiles = (files: ModSearchDatabase_ModInfo_File[] | undefined): NewestFileId | undefined => {
    if (!files || files.length === 0) return undefined;


    let newestFileId = "";
    let newestFileDateAdded = 0;

    for (const file of files) {
        const fileId = file.URL.slice(MOD_SEARCH_DATABASE_FILE_URL_PREFIX.length);

        if (fileId === "") continue;

        if (file.CreatedDate > newestFileDateAdded) {
            newestFileId = fileId;
            newestFileDateAdded = file.CreatedDate;
        }
    }


    return newestFileId;
};
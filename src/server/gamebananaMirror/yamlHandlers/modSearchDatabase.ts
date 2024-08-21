import type { NewestFileId } from "~/hooks/globalContexts/modDownloadUrl/constAndTypes";
import { getCurrentYaml, getFileSystemErrorString, getFileSystemPath, getUpdatedYaml } from "./utils/getUpdatedYamlFile";
import { GAMEBANANA_MOD_IMAGES_BASE_URL } from "~/hooks/globalContexts/modImageUrls/constsAndTypes";




const MOD_SEARCH_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/mod_search_database.yaml";

const MOD_SEARCH_DATABASE_JSON_FILENAME = process.env.MOD_SEARCH_DATABASE_JSON_FILENAME || "mod_search_database.json";

const modSearchDatabaseJsonPath = getFileSystemPath(MOD_SEARCH_DATABASE_JSON_FILENAME);


const MOD_SEARCH_DATABASE_YAML_NAME = "Mod Search Database";

const modSearchDatabaseFileSystemErrorString = getFileSystemErrorString(MOD_SEARCH_DATABASE_YAML_NAME);


const MOD_SEARCH_DATABASE_FILE_URL_PREFIX = "https://gamebanana.com/dl/";




export type ModSearchDatabaseYamlName = typeof MOD_SEARCH_DATABASE_YAML_NAME;


export type ModSearchDatabase_ModInfo_File = {
    URL: string;
    CreatedDate: number;
};


export type ModSearchDatabase_ModInfo = {
    GameBananaId: number;
    Screenshots: string[];
    Files: ModSearchDatabase_ModInfo_File[];
    CategoryName: string;
};


export type ModSearchDatabase = ModSearchDatabase_ModInfo[];




const isValidModSearchDatabase_ModInfo_Screenshots = (value: unknown): value is ModSearchDatabase_ModInfo["Screenshots"] => {
    if (!Array.isArray(value)) {
        console.log("value is not an array");
        return false;
    }


    for (const screenshot of value) {
        if (typeof screenshot !== "string" || !screenshot.startsWith(GAMEBANANA_MOD_IMAGES_BASE_URL)) {
            console.log("screenshot is not a string or does not start with the base url");
            return false;
        }
    }


    return true;
};


const isValidModSearchDatabase_ModInfo_Files = (value: unknown): value is ModSearchDatabase_ModInfo["Files"] => {
    if (!Array.isArray(value)) {
        console.log("value is not an array");
        return false;
    }


    for (const file of value) {
        if (typeof file !== "object" || file === null || "URL" in file === false || "CreatedDate" in file === false) {
            console.log("file is not an object or is null");
            return false;
        }

        if (typeof file.URL !== "string" || !file.URL.startsWith(MOD_SEARCH_DATABASE_FILE_URL_PREFIX)) {
            console.log("URL is not a string or does not start with the base url");
            return false;
        }


        const fileId = Number(file.URL.slice(MOD_SEARCH_DATABASE_FILE_URL_PREFIX.length));

        if (isNaN(fileId) || fileId <= 0) {
            console.log("fileId is not a number or is less than or equal to 0");
            return false;
        }


        if (typeof file.CreatedDate !== "number" || file.CreatedDate <= 0) {
            console.log("CreatedDate is not a number or is less than or equal to 0");
            return false;
        }
    }


    return true;
};


/** Only validates the parts of the object that this repository consumes. */
const isValidModSearchDatabase = (value: unknown): value is ModSearchDatabase => {
    if (!Array.isArray(value) || value.length === 0) {
        console.log("value is not an array or is empty");
        return false;
    }


    const modSearchDatabase = value as ModSearchDatabase;

    for (const mod of modSearchDatabase) {
        if (typeof mod !== "object" || mod === null || "GameBananaId" in mod === false || "Screenshots" in mod === false || "Files" in mod === false || "CategoryName" in mod === false) {
            console.log("mod is not an object or is null");
            return false;
        }

        if (typeof mod.GameBananaId !== "number") {
            console.log("GameBananaId is not a number");
            return false;
        }

        if (!isValidModSearchDatabase_ModInfo_Screenshots(mod.Screenshots)) {
            console.log("Screenshots are invalid");
            return false;
        }

        if (!isValidModSearchDatabase_ModInfo_Files(mod.Files)) {
            console.log("Files are invalid");
            console.log(JSON.stringify(mod));
            return false;
        }

        if (typeof mod.CategoryName !== "string") {
            console.log("CategoryName is not a string");
            return false;
        }
    }


    return true;
};




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




const trimModSearchDatabase = (modSearchDatabase: ModSearchDatabase): ModSearchDatabase => {
    const trimmedModSearchDatabase: ModSearchDatabase = [];

    for (const mod of modSearchDatabase) {
        if (mod.CategoryName !== "Maps") continue;

        const trimmedMod = {
            GameBananaId: mod.GameBananaId,
            Screenshots: mod.Screenshots,
            Files: mod.Files,
            CategoryName: mod.CategoryName,
        };

        trimmedModSearchDatabase.push(trimmedMod);
    }


    return trimmedModSearchDatabase;
};




/** Returns the mod search database json file currently stored on disk. */
export const getCurrentModSearchDatabase = async (): Promise<ModSearchDatabase> => {
    const parsedYaml = getCurrentYaml(
        MOD_SEARCH_DATABASE_YAML_URL,
        MOD_SEARCH_DATABASE_YAML_NAME,
        modSearchDatabaseFileSystemErrorString,
        modSearchDatabaseJsonPath,
        isValidModSearchDatabase,
        trimModSearchDatabase,
    );


    return parsedYaml;
};




/** Updates the mod search database json file.
 * Also returns the parsed and validated object.
*/
export const getUpdatedModSearchDatabase = async (): Promise<ModSearchDatabase> => {
    const parsedYaml = getUpdatedYaml(
        MOD_SEARCH_DATABASE_YAML_URL,
        MOD_SEARCH_DATABASE_YAML_NAME,
        modSearchDatabaseFileSystemErrorString,
        modSearchDatabaseJsonPath,
        isValidModSearchDatabase,
        trimModSearchDatabase,
    );


    return parsedYaml as Promise<ModSearchDatabase>; //TODO!!: remove this cast if possible
};
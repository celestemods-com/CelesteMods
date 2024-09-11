import { getFileSystemErrorString } from "../utils/getFileSystemErrorString";
import { getFileSystemPath } from "../utils/getFileSystemPath";




export const MOD_SEARCH_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/mod_search_database.yaml";

const MOD_SEARCH_DATABASE_JSON_FILENAME = process.env.MOD_SEARCH_DATABASE_JSON_FILENAME || "mod_search_database.json";

export const modSearchDatabaseJsonPath = getFileSystemPath(MOD_SEARCH_DATABASE_JSON_FILENAME);


export const MOD_SEARCH_DATABASE_YAML_NAME = "Mod Search Database";

export const modSearchDatabaseFileSystemErrorString = getFileSystemErrorString(MOD_SEARCH_DATABASE_YAML_NAME);


export const MOD_SEARCH_DATABASE_FILE_URL_PREFIX = "https://gamebanana.com/dl/";




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
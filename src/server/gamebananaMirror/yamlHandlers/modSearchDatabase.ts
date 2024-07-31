import { getCurrentYaml, getFileSystemErrorString, getUpdatedYaml } from "./utils/getUpdatedYamlFile";




const MOD_SEARCH_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/mod_search_database.yaml";

const MOD_SEARCH_DATABASE_JSON_PATH = process.env.MOD_SEARCH_DATABASE_PATH || "./public/mod_search_database.json";


const MOD_SEARCH_DATABASE_YAML_NAME = "Mod Search Database";

const modSearchDatabaseFileSystemErrorString = getFileSystemErrorString(MOD_SEARCH_DATABASE_YAML_NAME);




export type ModSearchDatabase = Record<string, unknown>;




/** Only validates the parts of the object that this repository consumes. */
const isValidModSearchDatabase = (value: unknown): value is ModSearchDatabase => {
    return true;    // currently unused, so not validating anything
};




/** Returns the mod search database json file currently stored on disk. */
export const getCurrentModSearchDatabase = async (): Promise<ModSearchDatabase> => {
    const parsedYaml = getCurrentYaml(
        MOD_SEARCH_DATABASE_YAML_NAME,
        modSearchDatabaseFileSystemErrorString,
        MOD_SEARCH_DATABASE_JSON_PATH,
        isValidModSearchDatabase,
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
        MOD_SEARCH_DATABASE_JSON_PATH,
        isValidModSearchDatabase,
    );


    return parsedYaml;
};
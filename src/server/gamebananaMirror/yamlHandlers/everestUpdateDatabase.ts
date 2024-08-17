import { getCurrentYaml, getFileSystemErrorString, getFileSystemPath, getUpdatedYaml } from "./utils/getUpdatedYamlFile";




const EVEREST_UPDATE_DATABASE_YAML_URL = "https://maddie480.ovh/celeste/everest_update.yaml";

const EVEREST_UPDATE_DATABASE_JSON_FILENAME = process.env.EVEREST_UPDATE_DATABASE_JSON_FILENAME || "everest_update_database.json";

const everestUpdateDatabaseJsonPath = getFileSystemPath(EVEREST_UPDATE_DATABASE_JSON_FILENAME);


const EVEREST_UPDATE_DATABASE_YAML_NAME = "Everest Update Database";

const everestUpdateDatabaseFileSystemErrorString = getFileSystemErrorString(EVEREST_UPDATE_DATABASE_YAML_NAME);




export type EverestUpdateDatabaseYamlName = typeof EVEREST_UPDATE_DATABASE_YAML_NAME;


export type EverestUpdateDatabase = Record<string, unknown>;




/** Only validates the parts of the object that this repository consumes. */
const isValidEverestUpdateInfo = (value: unknown): value is EverestUpdateDatabase => {
    return true;    // currently unused, so not validating anything
};




/** Returns the everest update database json file currently stored on disk. */
export const getCurrentEverestUpdateDatabase = async (): Promise<EverestUpdateDatabase> => {
    const parsedYaml = getCurrentYaml(
        EVEREST_UPDATE_DATABASE_YAML_NAME,
        everestUpdateDatabaseFileSystemErrorString,
        everestUpdateDatabaseJsonPath,
        isValidEverestUpdateInfo,
    );
    

    return parsedYaml;
};




/** Updates the everest update database json file.
 * Also returns the parsed and validated object.
*/
export const getUpdatedEverestUpdateDatabase = async (): Promise<EverestUpdateDatabase> => {
    const parsedYaml = getUpdatedYaml(
        EVEREST_UPDATE_DATABASE_YAML_URL,
        EVEREST_UPDATE_DATABASE_YAML_NAME,
        everestUpdateDatabaseFileSystemErrorString,
        everestUpdateDatabaseJsonPath,
        isValidEverestUpdateInfo,
    );


    return parsedYaml as Promise<EverestUpdateDatabase>; //TODO!!: remove this cast if possible
};
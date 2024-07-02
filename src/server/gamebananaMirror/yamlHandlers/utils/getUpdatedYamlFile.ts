import { writeFile, readFile } from "fs/promises";
import { parse } from "yaml";
import { serverLogger as logger } from "~/logger/serverLogger";




const JSON_FILE_ENCODING = "utf-8";




export const getFileSystemErrorString = (yamlName: string) => `Failed to write the ${yamlName} to the file system.`;




export const getCurrentYaml = async <
    ParsedYaml extends Record<string, unknown>,
    TypePredicate extends (value: unknown) => value is ParsedYaml = (value: unknown) => value is ParsedYaml,
>(
    yamlName: string,
    fileSystemErrorString: string,
    jsonPath: string,
    isValidParsedYaml: TypePredicate,
): Promise<ParsedYaml> => {
    try {
        const currentModSearchDatabase = await readFile(jsonPath, JSON_FILE_ENCODING);


        const currentYaml = JSON.parse(currentModSearchDatabase);

        if (!isValidParsedYaml(currentYaml)) {
            throw `The current ${yamlName} failed validation.`;
        }


        return currentYaml;
    } catch (error) {
        logger.error(`Failed to read the ${yamlName} from the file system. ${error}`);

        throw fileSystemErrorString;
    }
};




/** Updates the json file with the latest yaml file.
 * Also returns the parsed and validated object.
*/
export const getUpdatedYaml = async <
    ParsedYaml extends Record<string, unknown>,
    TypePredicate extends (value: unknown) => value is ParsedYaml = (value: unknown) => value is ParsedYaml,
>(
    yamlUrl: string,
    yamlName: string,
    fileSystemErrorString: string,
    jsonPath: string,
    isValidParsedYaml: TypePredicate,
): Promise<ParsedYaml> => {
    logger.trace(`Downloading the ${yamlName}.`);


    const response = await fetch(yamlUrl);

    if (!response.ok) {
        throw `Failed to download the ${yamlName}. Status code: ${response.status}`;
    }

    logger.trace(`Successfully downloaded the ${yamlName}.`);


    const newYaml = await response.text();

    const parsedYaml: unknown = parse(newYaml);

    if (!isValidParsedYaml(parsedYaml)) {
        throw `The downloaded ${yamlName} failed validation.`;
    }

    logger.trace(`Successfully parsed the ${yamlName}.`);


    try {
        await writeFile(jsonPath, JSON.stringify(parsedYaml), JSON_FILE_ENCODING);
    } catch (error) {
        logger.error(`${fileSystemErrorString} ${error}`);

        throw fileSystemErrorString;
    }


    return parsedYaml;
};
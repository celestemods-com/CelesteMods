import { writeFile, readFile } from "fs/promises";
import { parse } from "yaml";
import { serverLogger as logger } from "~/logger/serverLogger";
import type { ModSearchDatabase, ModSearchDatabaseYamlName } from "../modSearchDatabase/constAndTypes";
import type { EverestUpdateDatabase, EverestUpdateDatabaseYamlName } from "../everestUpdateDatabase";




const JSON_FILE_ENCODING = "utf-8";

/** The beginning of the error when reading a non-extant file */
const NO_SUCH_FILE_ERROR = "Error: ENOENT: no such file or directory";




type YamlName = ModSearchDatabaseYamlName | EverestUpdateDatabaseYamlName;

type ParsedYaml<
    FileName extends YamlName,
> = FileName extends ModSearchDatabaseYamlName ? (
    ModSearchDatabase
) : (
        FileName extends EverestUpdateDatabaseYamlName ? (
            EverestUpdateDatabase
        ) : (
            never
        )
    );




export const getCurrentYaml = async <
    FileName extends YamlName,
    ParsedFile extends ParsedYaml<FileName> = ParsedYaml<FileName>,
    TypePredicate extends (value: unknown) => value is ParsedFile = (value: unknown) => value is ParsedFile,
>(
    yamlUrl: string,
    yamlName: FileName,
    fileSystemErrorString: string,
    jsonPath: string,
    isValidParsedYaml: TypePredicate,
    trimFile: (parsedFile: ParsedFile) => ParsedFile,
): Promise<ParsedFile> => {
    try {
        const currentModSearchDatabase = await readFile(jsonPath, JSON_FILE_ENCODING);


        const currentYaml = JSON.parse(currentModSearchDatabase);

        if (!isValidParsedYaml(currentYaml)) {
            throw `The current ${yamlName} failed validation.`;
        }


        return currentYaml;
    } catch (error) {
        logger.warn(`Failed to read the ${yamlName} from the file system. ${error}`);

        if (!String(error).startsWith(NO_SUCH_FILE_ERROR)) throw fileSystemErrorString;


        return getUpdatedYaml(
            yamlUrl,
            yamlName,
            fileSystemErrorString,
            jsonPath,
            isValidParsedYaml,
            trimFile,
        );
    }
};




/** Updates the json file with the latest yaml file.
 * Also returns the parsed and validated object.
*/
export const getUpdatedYaml = async <
    FileName extends YamlName,
    ParsedFile extends ParsedYaml<FileName> = ParsedYaml<FileName>,
    TypePredicate extends (value: unknown) => value is ParsedFile = (value: unknown) => value is ParsedFile,
>(
    yamlUrl: string,
    yamlName: YamlName,
    fileSystemErrorString: string,
    jsonPath: string,
    isValidParsedYaml: TypePredicate,
    trimFile: (parsedFile: ParsedFile) => ParsedFile,
): Promise<ParsedFile> => {
    logger.debug(`Downloading the ${yamlName}.`);


    const response = await fetch(yamlUrl);

    if (!response.ok) {
        logger.error(`Failed to download the ${yamlName}. Status code: ${response.status}`);

        throw `Failed to download the ${yamlName}. Status code: ${response.status}`;
    }

    logger.debug(`Successfully downloaded the ${yamlName}.`);


    const newYaml = await response.text();

    const parsedYaml: unknown = parse(newYaml);

    if (!isValidParsedYaml(parsedYaml)) {
        logger.error(`The downloaded ${yamlName} failed validation.`);

        throw `The downloaded ${yamlName} failed validation.`;
    }

    logger.debug(`Successfully parsed the ${yamlName}.`);


    let trimmedfile: ParsedFile;

    if (trimFile) {
        trimmedfile = trimFile(parsedYaml);
    } else {
        trimmedfile = parsedYaml;
    }


    try {
        await writeFile(jsonPath, JSON.stringify(trimmedfile), JSON_FILE_ENCODING);
    } catch (error) {
        logger.error(`${fileSystemErrorString} ${error}`);

        throw fileSystemErrorString;
    }


    return trimmedfile;
};
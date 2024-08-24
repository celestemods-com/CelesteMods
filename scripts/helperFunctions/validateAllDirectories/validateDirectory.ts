import path from "path";
import { access, mkdir, constants } from "fs/promises";
import { serverLogger as logger } from "~/logger/serverLogger";




/**
 * Validates that the directory at the given path exists and that Node has the specified permissions.
 * By default, checks that the directory is writable.
 * If the directory does not exist, creates it.
 * 
 * @param relativeDirectoryPath The relative path of the directory to validate. Relative to the project root. https://nodejs.org/api/fs.html#fspromisesaccesspath-mode
 * @param mode The mode to check the directory with. Defaults to `fs.constants.W_OK`. https://nodejs.org/api/fs.html#file-access-constants
 * 
 * @throws {Error} If the directory does not exist or Node does not have the specified permissions.
 */
export const validateDirectory = async (relativeDirectoryPath: string, mode = constants.W_OK): Promise<void> => {
    const absoluteDirectoryPath = path.resolve("~/../", relativeDirectoryPath);
    // const absoluteDirectoryPath = path.resolve(process.cwd(), relativeDirectoryPath);  // This is how Next.js recommends, but the above seems simpler and works fine. Apparently process.cwd() can behave differently in different environments?


    // If the directory does not exist, create it.
    try {
        await access(absoluteDirectoryPath, constants.F_OK);
    } catch (accessError) {
        try {
            await mkdir(absoluteDirectoryPath, { recursive: true });

            console.log(`Created the ${relativeDirectoryPath} directory at ${absoluteDirectoryPath}.`);
            logger.info (`Created the ${relativeDirectoryPath} directory at ${absoluteDirectoryPath}.`);    // The logger doesn't log to console here as the NODE_ENV is not set. It only logs to the file.
        } catch (createError) {
            throw new Error(`The ${relativeDirectoryPath} directory does not exist at ${absoluteDirectoryPath} and could not be created. createError: ${createError}. accessError: ${accessError}`);
        }
    }


    // Check that the directory has the specified permissions.
    try {
        await access(absoluteDirectoryPath, mode);
    } catch (error) {
        throw new Error(`The ${relativeDirectoryPath} directory does not exist at ${absoluteDirectoryPath} or Node does not have the specified permissions. Specified permissions: "${mode}". Error: ${error}`);
    }
};
import type { FileCategory } from "./constsAndTypes";




/** Uses the Cloudflare R2 S3 API to get the list of files currently saved for the specified category.
 * Returns the list of file names, or an HTTP status code if there was an error.
 */
export const getFileListForCategory = async (fileCategory: FileCategory): Promise<string[] | number> => {
    // TODO!!! Implement this

    return 500;
};
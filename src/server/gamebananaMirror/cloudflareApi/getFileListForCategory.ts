import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, R2_BUCKET_NAMES } from "./constsAndTypes";




const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.GAMEBANANA_MIRROR_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.GAMEBANANA_MIRROR_CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.GAMEBANANA_MIRROR_CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
    },
});




/** Uses the Cloudflare R2 S3 API to get the list of files currently saved for the specified category.
 * Returns the list of file names, or an HTTP status code if there was an error.
 */
export const getFileListForCategory = async (fileCategory: FileCategory): Promise<string[] | number> => {
    const bucketName = R2_BUCKET_NAMES[fileCategory];


    const command = new ListObjectsV2Command({
        Bucket: bucketName,
    });


    logger.info(`Retrieving file list for category ${fileCategory}`);

    let responseContents;

    try {
        const response = await s3Client.send(command);

        responseContents = response.Contents;
    } catch (error) {
        logger.error(`Error retrieving file list for category ${fileCategory}: ${error}`);

        return 500;
    }

    if (!responseContents) {
        logger.error(`Error retrieving file list for category ${fileCategory}: No response contents`);

        return 500;
    }


    const fileNames: string[] = [];
    let isInvalidFileName = false;

    for (const object of responseContents) {
        const fileName = object.Key;

        if (typeof fileName !== "string") {
            logger.warn(`Skipping invalid file name: ${fileName}`);

            isInvalidFileName = true;

            continue;
        }


        fileNames.push(fileName);
    }


    if (isInvalidFileName && fileNames.length === 0) {
        logger.warn(`Retrieved file list for category ${fileCategory} but all file names were invalid`);

        return 520;
    }


    logger.info(`Retrieved file list for category ${fileCategory}: ${fileNames.length} files`);

    return fileNames;
};
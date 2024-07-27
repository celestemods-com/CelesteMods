import type { NextApiRequest, NextApiResponse } from "next";
import { serverLogger as logger } from "~/logger/serverLogger";
import { isFileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";
import { getFileListForCategory } from "~/server/gamebananaMirror/cloudflareApi/getFileListForCategory";



/** Returns the list of files currently saved for the specified category */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { fileCategory } = req.query;

    logger.debug(`Received request to get file list for category: ${fileCategory}`);

    if (!isFileCategory(fileCategory)) {
        logger.debug(`Invalid file category: ${fileCategory}`);

        res.status(400).json("Invalid file category");

        return;
    }


    logger.debug(`Getting file list for category: ${fileCategory}`);

    const fileList = await getFileListForCategory(fileCategory);

    if (typeof fileList === "number") {
        logger.warn(`Failed to get file list for category: ${fileCategory}. Status code: ${fileList}`);
        
        res.status(fileList).end();

        return;
    }


    logger.debug(`Successfully retrieved file list for category: ${fileCategory}`);

    res.status(200).json(fileList);
};

export default handler;
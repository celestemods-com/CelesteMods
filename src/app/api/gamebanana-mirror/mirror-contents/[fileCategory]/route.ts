import { type NextRequest, NextResponse } from "next/server";
import { serverLogger as logger } from "~/logger/serverLogger";
import { isFileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";
import { getFileListForCategory } from "~/server/gamebananaMirror/cloudflareApi/getFileListForCategory";




type GetRequestParams = {
    fileCategory: string;
};




/** Returns the list of files currently saved for the specified category */
export const GET = async (
    _request: NextRequest,
    { params }: { params: GetRequestParams; },
) => {
    const { fileCategory } = params;

    logger.debug(`Received request to get file list for category: ${fileCategory}`);

    if (!isFileCategory(fileCategory)) {
        logger.debug(`Invalid file category: ${fileCategory}`);

        return new NextResponse(
            "Invalid file category",
            {
                status: 400,
            }
        );
    }


    logger.debug(`Getting file list for category: ${fileCategory}`);

    const fileList = await getFileListForCategory(fileCategory);

    if (typeof fileList === "number") {
        logger.warn(`Failed to get file list for category: ${fileCategory}. Status code: ${fileList}`);

        return new NextResponse(
            null,
            {
                status: fileList,
            }
        );
    }


    logger.debug(`Successfully retrieved file list for category: ${fileCategory}`);

    return new NextResponse(
        JSON.stringify(fileList),
        {
            status: 200,
        }
    );
};
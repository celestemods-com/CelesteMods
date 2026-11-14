import { NextResponse } from "next/server";
import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, isFileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";
import { type RequestHandlerResult, serverSideEventHelper } from "~/server/gamebananaMirror/utils/serverSideEvents/serverSideEventHelper";
import { getFileListForCategory } from "~/server/gamebananaMirror/cloudflareApi/getFileListForCategory";




const getFileList = async (fileCategory: FileCategory): Promise<RequestHandlerResult> => {
    logger.debug(`Getting file list for category: ${fileCategory}`);

    const fileList = await getFileListForCategory(fileCategory);

    if (typeof fileList === "number") {
        const errorMessage = `Failed to get file list for category: ${fileCategory}. Status code: ${fileList}`;

        logger.warn(errorMessage);

        return { status: "error", code: fileList, message: errorMessage };
    }


    logger.debug(`Successfully retrieved file list for category: ${fileCategory}`);

    return { status: "complete", code: 200, message: JSON.stringify(fileList) };
};




export const getFileListHandler = async (fileCategory: string): Promise<NextResponse> => {
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


    return serverSideEventHelper(() => getFileList(fileCategory));
};
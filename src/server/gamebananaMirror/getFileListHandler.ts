import { type NextRequest, NextResponse } from "next/server";
import { serverLogger as logger } from "~/logger/serverLogger";
import { type FileCategory, isFileCategory } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";
import { type RequestHandlerResult, serverSideEventHelper } from "~/server/gamebananaMirror/utils/serverSideEvents/serverSideEventHelper";
import { getFileListForCategory } from "~/server/gamebananaMirror/cloudflareApi/getFileListForCategory";




/** Receives a validated file category and retrieves the corresponding file list. */
const getFileList = async (
    fileCategory: FileCategory,
    abortSignal: AbortSignal,
): Promise<RequestHandlerResult> => {
    logger.debug(`Getting file list for category: ${fileCategory}`);

    const fileList = await getFileListForCategory(fileCategory, abortSignal);

    if (typeof fileList === "number") {
        const errorMessage = `Failed to get file list for category: ${fileCategory}. Status code: ${fileList}`;

        logger.warn(errorMessage);

        return { status: "error", code: fileList, message: errorMessage };
    }


    logger.debug(`Successfully retrieved file list for category: ${fileCategory}`);

    return { status: "complete", code: 200, message: JSON.stringify(fileList) };
};




/** 
 * Retrieves the file list for the specified file category.
 * Performs validation on the file category parameter, opens a SSE stream, and then retrieves the file list for the specified category.
 */
export const getFileListHandler = async ({
    request,
    fileCategory,
}: {
    request: NextRequest,
    fileCategory: string
}): Promise<NextResponse> => {
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


    return serverSideEventHelper({
        request,
        requestHandler: () => getFileList(fileCategory, request.signal),
        startMessage: `Starting file list retrieval for category: ${fileCategory}`,
    });
};
import { type NextRequest, NextResponse } from "next/server";
import { FILE_CATEGORIES } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";




/** Returns the list of valid file categories */
export const GET = (_request: NextRequest) => {
    const responseMessage = JSON.stringify(FILE_CATEGORIES);


    return new NextResponse(
        responseMessage,
        {
            status: 200,
        }
    );
};
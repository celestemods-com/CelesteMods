import type { NextRequest } from "next/server";
import { getFileListHandler } from "~/server/gamebananaMirror/getFileListHandler";



// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store"; // Unsure if this is necessary - the Next.js documentation isn't very clear.




type GetRequestParams = {
    fileCategory: string;
};


/** Returns the list of files currently saved for the specified category */
export const GET = async (
    _request: NextRequest,
    { params }: { params: GetRequestParams; },
) => {
    const { fileCategory } = params;

    return getFileListHandler(fileCategory);
};
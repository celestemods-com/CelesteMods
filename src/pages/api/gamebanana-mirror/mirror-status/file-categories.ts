import type { NextApiRequest, NextApiResponse } from "next";
import { FILE_CATEGORIES } from "~/server/gamebananaMirror/cloudflareApi/constsAndTypes";




/** Returns the list of valid file categories */
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(FILE_CATEGORIES);
};

export default handler;
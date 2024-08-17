import type { NextApiRequest, NextApiResponse } from "next";
import { createOpenApiNextHandler } from "trpc-openapi";

import { apiRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";




const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    return createOpenApiNextHandler({
        router: apiRouter,
        createContext: createTRPCContext,
    })(req, res);
};

export default handler;
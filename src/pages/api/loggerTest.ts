import { NextApiRequest, NextApiResponse } from "next";
import { logger } from "~/logger/logger";


export default function (_req: NextApiRequest, res: NextApiResponse) {
    logger.warn("Logging warn from loggerTest.ts");
    logger.info("Logging info from loggerTest.ts");
    logger.trace("Logging trace from loggerTest.ts");

    res.send("Hello from loggerTest.ts");

    throw "this is an error string lmao"
}
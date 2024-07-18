import type { NextApiRequest, NextApiResponse } from "next";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




/** Handle authentication tests of the update webhook */
const handler = async (req: NextApiRequest, res: NextApiResponse) => updateWebhookHandler(req, res, false, true);

export default handler;
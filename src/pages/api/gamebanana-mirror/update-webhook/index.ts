import type { NextApiRequest, NextApiResponse } from "next";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




/** Handle actual update webhook requests */
const handler = async (req: NextApiRequest, res: NextApiResponse) => updateWebhookHandler(req, res, true, false);

export default handler;
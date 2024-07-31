import type { NextRequest } from "next/server";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




/** Handle actual update webhook requests */
export const POST = async (req: NextRequest) => updateWebhookHandler(req, true, false);
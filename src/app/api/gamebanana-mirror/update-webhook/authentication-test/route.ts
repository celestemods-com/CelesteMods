import type { NextRequest } from "next/server";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




/** Handle authentication tests of the update webhook */
export const POST = async (req: NextRequest) => updateWebhookHandler(req, false, true);
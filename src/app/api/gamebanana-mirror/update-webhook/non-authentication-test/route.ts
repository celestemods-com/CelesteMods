import type { NextRequest } from "next/server";
import { serverSideEventHelper } from "~/server/gamebananaMirror/utils/serverSideEvents/serverSideEventHelper";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




// Force dynamic rendering for this route
export const dynamic = "force-dynamic";


/** Handle non-authentication tests of the update webhook */
export const POST = async (req: NextRequest) => serverSideEventHelper(() => updateWebhookHandler(req, false, false));
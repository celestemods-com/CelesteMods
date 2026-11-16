import type { NextRequest, NextResponse } from "next/server";
import { getWebhookUpdateState, updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




// Force dynamic rendering for this route
export const dynamic = "force-dynamic";



/** Retrieve the current update webhook status */
export const GET = (): NextResponse => getWebhookUpdateState();


/** Handle actual update webhook requests */
export const POST = async (req: NextRequest): Promise<NextResponse> => updateWebhookHandler(req, true, false);

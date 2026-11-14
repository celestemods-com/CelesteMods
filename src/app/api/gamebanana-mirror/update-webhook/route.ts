import type { NextRequest, NextResponse } from "next/server";
import { serverSideEventHelper } from "~/server/gamebananaMirror/utils/serverSideEvents/serverSideEventHelper";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";



// Force dynamic rendering for this route
export const dynamic = "force-dynamic";


/** Handle actual update webhook requests */
export const POST = async (req: NextRequest): Promise<NextResponse> => serverSideEventHelper(() => updateWebhookHandler(req, true, false));

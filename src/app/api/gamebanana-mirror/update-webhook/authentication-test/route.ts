import type { NextRequest, NextResponse } from "next/server";
import { updateWebhookHandler } from "~/server/gamebananaMirror/updateWebhook";




// Force dynamic rendering for this route
export const dynamic = "force-dynamic";


/** Handle authentication tests of the update webhook */
export const POST = async (req: NextRequest): Promise<NextResponse> => updateWebhookHandler(req, false, true);
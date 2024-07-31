import type { headers } from "next/headers";
import { validateIp } from "./utils/validateIp";
import { validateWebhookCredentials } from "./utils/validateWebhookCredentials";
import { logGeneratedSignature } from "./logGeneratedSignature";




const PERMITTED_STALENESS_SECONDS = 60;
const PERMITTED_EARLINESS_SECONDS = 15;




/** This function returns HTTP status codes.
 * 200: The request is authenticated.
 * 400: The request body was missing or otherwise unparsable.
 * 401 or 403: The request is not authenticated.
 * 500: Other error.
 */
export const authenticateUpdateWebhookRequest = async (
    requestHeadersList: ReturnType<typeof headers>,
    requestBodyString: string,
    requestBodyObject: object,
): Promise<number> => {
    const ipStatusCode = validateIp(requestHeadersList, "GAMEBANANA_MIRROR_UPDATE_WEBHOOK_IPS");

    if (ipStatusCode !== 200) {
        return ipStatusCode;
    }


    if (process.env.NODE_ENV === "development") await logGeneratedSignature(requestBodyString);

    const authenticationStatusCode = await validateWebhookCredentials(requestHeadersList, PERMITTED_STALENESS_SECONDS, PERMITTED_EARLINESS_SECONDS, requestBodyString, requestBodyObject);


    return authenticationStatusCode;
};
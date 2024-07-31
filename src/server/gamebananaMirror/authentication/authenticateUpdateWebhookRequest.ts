import type { headers } from "next/headers";
import { validateIp } from "./utils/validateIp";
import { validateWebhookCredentials } from "./utils/validateWebhookCredentials";
import { logGeneratedSignature } from "./logGeneratedSignature";




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

    const authenticationStatusCode = await validateWebhookCredentials(requestHeadersList, 15, 5, requestBodyString, requestBodyObject);


    return authenticationStatusCode;
};
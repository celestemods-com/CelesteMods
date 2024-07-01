import type { NextApiRequest } from "next";
import { validateIp } from "./utils/validateIp";
import { validateWebhookCredentials } from "./utils/validateWebhookCredentials";




/** This function returns HTTP status codes.
 * 200: The request is authenticated.
 * 401 or 403: The request is not authenticated.
 * 500: Other error.
 */
export const authenticateUpdateWebhookRequest = async (request: NextApiRequest): Promise<number> => {
    const ipStatusCode = validateIp(request, "GAMEBANANA_MIRROR_UPDATE_WEBHOOK_IPS");

    if (ipStatusCode !== 200) {
        return ipStatusCode;
    }


    const authenticationStatusCode = await validateWebhookCredentials(request, 15, 5);

    return authenticationStatusCode;
};
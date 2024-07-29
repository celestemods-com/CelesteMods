import type { headers } from "next/headers";
import { serverLogger as logger } from "~/logger/serverLogger";
import { stringToArrayBuffer } from "../../arrayBufferProcessing/stringToArrayBuffer";
import { importPublicKey } from "./importPublicKey";
import { getCurrentTime } from "~/server/api/utils/getCurrentTime";
import { base64StringToArrayBuffer } from "../../arrayBufferProcessing/base64StringToArrayBuffer";




/** Expects the current Unix time in seconds as request body.
 * This function returns HTTP status codes.
 * 200: The credentials are valid.
 * 400: The request body was not accepted (includes too-old requests).
 * 401: The credentials were missing or otherwise unparsable.
 * 403: The credentials were invalid.
 * 500: Other error.
 */


// based on https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#subjectpublickeyinfo_import
export const validateWebhookCredentials = async (
    requestHeadersList: ReturnType<typeof headers>,
    permittedStalenessSeconds: number,
    permittedEarlienessSeconds: number,
    requestBodyString: string,
): Promise<number> => {
    const publicKeysString = process.env.GAMEBANANA_MIRROR_UPDATE_WEBHOOK_PUBLIC_KEYS;

    if (publicKeysString === undefined) {
        logger.error("The environment variable GAMEBANANA_MIRROR_UPDATE_WEBHOOK_PUBLIC_KEYS is not defined.");

        return 500;
    }

    const publicKeysStringArray = publicKeysString.split(",");

    if (publicKeysStringArray.length === 0) {
        logger.error("The environment variable GAMEBANANA_MIRROR_UPDATE_WEBHOOK_PUBLIC_KEYS is empty.");

        return 500;
    }


    let publicKeysArray: CryptoKey[];

    try {
        publicKeysArray = await Promise.all(publicKeysStringArray.map(importPublicKey));
    } catch (error) {
        logger.error("Error importing public keys.", error);

        return 500;
    }


    const requestBody = JSON.parse(requestBodyString);

    if (typeof requestBody !== "object" || "timestamp" in requestBody === false) {
        logger.debug("The request body was invalid or did not contain a timestamp.");

        return 400;
    };

    const timestamp = requestBody.timestamp;

    if (Number.isNaN(timestamp)) {
        logger.debug("The timestamp was not a number.");

        return 400;
    }


    const currentTime = getCurrentTime();

    if (timestamp < 0 || timestamp > currentTime + permittedStalenessSeconds || timestamp < currentTime - permittedEarlienessSeconds) {
        logger.info(`The timestamp was not accepted: ${timestamp}`);

        return 400;
    }




    const requestBodyArrayBuffer = stringToArrayBuffer(requestBodyString);


    const signatureString = requestHeadersList.get("Authorization");

    if (typeof signatureString !== "string" || signatureString === "") {
        logger.info("The credentials were missing or otherwise unparsable.");

        return 401;
    }

    const signature = base64StringToArrayBuffer(signatureString);


    const isVerifiedArray = await Promise.all(
        publicKeysArray.map(
            async (publicKey) => await crypto.subtle.verify(
                {
                    name: "RSA-PSS",
                    saltLength: 32,
                },
                publicKey,
                signature,
                requestBodyArrayBuffer,
            ),
        ),
    );


    const isVerified = isVerifiedArray.some((value) => value);

    if (!isVerified) {
        logger.info("The credentials were invalid.");

        return 403;
    }




    logger.info("The credentials are valid.");

    return 200;
};
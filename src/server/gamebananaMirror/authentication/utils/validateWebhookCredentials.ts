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
    requestBodyObject: object,
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




    if ("timestamp" in requestBodyObject === false) {
        logger.info("The request body was missing the timestamp.");

        return 401;
    };


    const timestamp = Number(requestBodyObject.timestamp);

    if (Number.isNaN(timestamp)) {
        logger.info("The timestamp was not a number.");

        return 401;
    }


    const currentTime = getCurrentTime();
    const permittedStalenessMilliseconds = permittedStalenessSeconds * 1000;
    const permittedEarlienessMilliseconds = permittedEarlienessSeconds * 1000;

    // if (timestamp < 0 || timestamp > currentTime + permittedStalenessMilliseconds || timestamp < currentTime - permittedEarlienessMilliseconds) {
    //     logger.info(`The timestamp was not accepted. currentTime: ${currentTime}, timestamp: ${timestamp}`);

    //     return 401;
    // }    TODO!!!: uncomment this block after testing

    logger.info(`The timestamp was accepted: ${timestamp}`);




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
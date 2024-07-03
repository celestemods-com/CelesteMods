import type { NextApiRequest } from "next";
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
export const validateWebhookCredentials = async (request: NextApiRequest, permittedStalenessSeconds: number, permittedEarlienessSeconds: number): Promise<number> => {
    const publicKeysString = process.env.GAMEBANANA_MIRROR_UPDATE_WEBHOOK_PUBLIC_KEYS;

    if (publicKeysString === undefined) {
        return 500;
    }

    const publicKeysStringArray = publicKeysString.split(",");

    if (publicKeysStringArray.length === 0) {
        return 500;
    }


    let publicKeysArray: CryptoKey[];

    try {
        publicKeysArray = await Promise.all(publicKeysStringArray.map(importPublicKey));
    } catch (error) {
        return 500;
    }


    const requestBodyString = request.body;

    if (typeof requestBodyString !== "string" || requestBodyString === "") {
        return 401;
    }


    const requestBodyNumber = Number(requestBodyString);

    if (Number.isNaN(requestBodyNumber)) {
        return 400;
    }

    const currentTime = getCurrentTime();

    if (requestBodyNumber < 0 || requestBodyNumber > currentTime + permittedStalenessSeconds || requestBodyNumber < currentTime - permittedEarlienessSeconds) {
        return 400;
    }


    const requestBodyArrayBuffer = stringToArrayBuffer(requestBodyString);


    const signatureString = request.headers["Authorization"];

    if (typeof signatureString !== "string" || signatureString === "") {
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
        return 403;
    }


    return 200;
};
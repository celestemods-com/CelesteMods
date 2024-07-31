import { stringToArrayBuffer } from "../arrayBufferProcessing/stringToArrayBuffer";
import { arrayBufferToBase64String } from "../arrayBufferProcessing/base64StringToArrayBuffer";
import { importPrivateKey } from "./utils/importPrivateKey";
import { SALT_LENGTH } from "./getStorageRequestSignature";




export const logGeneratedSignature = async (requestBodyString: string) => {
    const privateKeyString = process.env["GAMEBANANA_MIRROR_UPDATE_WEBHOOK_PRIVATE_KEY"];

    if (privateKeyString === undefined) {
        console.error("Private key not found in environment");
        return;
    }


    const privateKey = await importPrivateKey(privateKeyString);


    const requestBodyArrayBuffer = stringToArrayBuffer(requestBodyString);


    const signature = await crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: SALT_LENGTH,
        },
        privateKey,
        requestBodyArrayBuffer,
    );


    const signatureString = arrayBufferToBase64String(signature);

    console.log(signatureString);
};
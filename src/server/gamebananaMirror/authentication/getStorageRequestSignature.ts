import { stringToArrayBuffer } from "./utils/keyHandling/stringToArrayBuffer";
import { importPrivateKey } from "./utils/keyHandling/importPrivateKey";
import { arrayBufferToBase64String } from "./utils/keyHandling/base64StringToArrayBuffer";




export const SALT_LENGTH = 32;




export const getStorageRequestSignature = async (requestBodyString: string): Promise<string> => {
    if (requestBodyString === "") {
        throw "Request body string is empty";
    }


    const privateKeyString = process.env.STORAGE_REQUEST_SIGNATURE_PRIVATE_KEY;

    if (privateKeyString === undefined || privateKeyString === "") {
        throw "Private key string is empty";
    }


    let privateKey: CryptoKey;

    try {
        privateKey = await importPrivateKey(privateKeyString);
    } catch (error) {
        throw `Failed to import the private key. ${error}`;
    }


    const requestBodyArrayBuffer = stringToArrayBuffer(requestBodyString);

    const signature = await crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: SALT_LENGTH,
        },
        privateKey,
        requestBodyArrayBuffer,
    );


    return arrayBufferToBase64String(signature);
};
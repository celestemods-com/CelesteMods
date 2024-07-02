import { base64StringToArrayBuffer } from "./base64StringToArrayBuffer";




/** Imports an RSA public key.
 * Assumes base64 encoding, spki format, and RSA-PSS algorithm with SHA-256 hash.
 * Non-extractable, only for verifying signatures.
*/
export const importPrivateKey = (privateKeyString: string): Promise<CryptoKey> => {
    const binaryDer = base64StringToArrayBuffer(privateKeyString);

    
    // parse the DER-encoded binary data
    const privateKey = crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSA-PSS",
            hash: "SHA-256",
        },
        false,
        ["sign"],
    );


    return privateKey;
};
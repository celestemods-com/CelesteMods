import { stringToArrayBuffer } from "./stringToArrayBuffer";




export const base64StringToArrayBuffer = (base64String: string): ArrayBuffer => {
    // base64 decode the string to get the binary data
    const binaryDerString = atob(base64String);

    // convert from a binary string to an ArrayBuffer
    const binaryDer = stringToArrayBuffer(binaryDerString);

    return binaryDer;
};
import { arrayBufferToString, stringToArrayBuffer } from "./stringToArrayBuffer";




export const base64StringToArrayBuffer = (base64String: string): ArrayBuffer => {
    // base64 decode the string to get the binary data
    const binaryDerString = atob(base64String);

    // convert from a binary string to an ArrayBuffer
    const binaryDer = stringToArrayBuffer(binaryDerString);

    return binaryDer;
};




export const arrayBufferToBase64String = (arrayBuffer: ArrayBuffer): string => {
    // convert from an ArrayBuffer to a binary string
    const binaryString = arrayBufferToString(arrayBuffer);

    // base64 encode the binary string
    const base64String = btoa(binaryString);

    return base64String;
};
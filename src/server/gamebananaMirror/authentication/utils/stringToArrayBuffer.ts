export const stringToArrayBuffer = (string: string) => {
    const stringLength = string.length;


    const buffer = new ArrayBuffer(stringLength);

    const bufferView = new Uint8Array(buffer);


    for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
        bufferView[characterIndex] = string.charCodeAt(characterIndex);
    }


    return buffer;
};
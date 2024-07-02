
export const stringToArrayBuffer = (string: string) => {
    const stringLength = string.length;


    const buffer = new ArrayBuffer(stringLength);

    const bufferView = new Uint8Array(buffer);


    for (let characterIndex = 0; characterIndex < stringLength; characterIndex++) {
        bufferView[characterIndex] = string.charCodeAt(characterIndex);
    }


    return buffer;
};




export const arrayBufferToString = (arrayBuffer: ArrayBuffer): string => {
    const bufferView = new Uint8Array(arrayBuffer);


    const stringArray: string[] = [];

    for (let characterIndex = 0; characterIndex < bufferView.length; characterIndex++) {
        const characterCode = bufferView[characterIndex];

        if (characterCode === undefined) {
            throw "Character code is undefined";
        }

        stringArray.push(String.fromCharCode(characterCode));
    }


    return stringArray.join("");
};
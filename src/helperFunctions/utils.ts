export const isNumberArray = function (unknownArray: unknown[]): unknownArray is number[] {
    if (unknownArray && !unknownArray.length) {
        return false
    }

    for (const element of unknownArray) {
        if (typeof (element) != "number") {
            return false;
        }
    }

    return true;
}


export const getCurrentTime = function () {
    return Math.floor(new Date().getTime() / 1000);
}
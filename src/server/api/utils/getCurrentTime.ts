/** Returns current Unix time in seconds */
export const getCurrentTime = function () {
    return Math.floor(new Date().getTime() / 1000);
}
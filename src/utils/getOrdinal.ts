/** `returnZeroth` defaults to `true` */
export const getOrdinal = (
    n: number, 
    returnZeroth = true,
): string => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    if (n === 0 && !returnZeroth) return "";

    return `${n}th`;
}
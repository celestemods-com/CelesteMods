export const truncateString = (string: string, maxLength: number, trimString = true, ellipsis = "...") => {
    const trimmedString = trimString ? string.trim() : string;


    if (trimmedString.length <= maxLength) {
        return trimmedString;
    }


    return trimmedString.slice(0, maxLength - ellipsis.length) + ellipsis;
}
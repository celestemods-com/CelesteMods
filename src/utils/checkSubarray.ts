export type CheckSubarray <
    Array extends any[],
    Subarray extends Array[],
> = Subarray extends [...infer R] ? R : never;


export const checkSubarray = <
    Array extends any[],
    Subarray extends Array[],
>(
    array: Array,
    subarray: Subarray,
): subarray is Subarray => {
    for (const element of subarray) {
        if (!array.includes(element)) {
            return false;
        }
    }

    return true;
}
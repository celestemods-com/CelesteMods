export type NonEmptyArray<T extends any[] | readonly any[]> = [T[number], ...T[number][]];


export const getNonEmptyArray = <
    T extends any[] | readonly any[] | { [key: string | number | symbol]: any },
    P extends (
        T extends any[] | readonly any[] ? T[number] : T[keyof T]
    ),
>(
    item: T,
): [P, ...P[]] => {
    if (Array.isArray(item)) {
        if (!item.length) throw "item is an empty array!";

        return item as [P, ...P[]];
    }
    else {
        const entries = Object.entries(item);

        if (!entries.length) throw "item is an empty object";


        const parameters = entries.map(([_key, element]) => element);

        if (!parameters.length) throw "parameters is empty";


        return parameters as [P, ...P[]];
    }
}
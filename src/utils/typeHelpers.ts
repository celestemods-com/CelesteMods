export type NonEmptyArray<T, IsReadonly extends boolean = true> = IsReadonly extends true ? readonly [T, ...T[]] : [T, ...T[]];


export const getNonEmptyArray = <
    T extends any[] | readonly any[] | { [key: string | number | symbol]: any },
    K extends (T extends any[] | readonly any[] ? T[number] : T[keyof T]),
>(
    item: T,
): [K, ...K[]] => {
    if (Array.isArray(item)) {
        if (!item.length) throw "item is an empty array!";

        return item as [K, ...K[]];
    }
    else {
        const entries = Object.entries(item);

        if (!entries.length) throw "item is an empty object";


        const parameters = entries.map(([_key, element]) => element);

        if (!parameters.length) throw "parameters is empty";


        return parameters as [K, ...K[]];
    }
}
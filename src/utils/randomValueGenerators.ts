




/** Random integer from min (included) to max (excluded). */
export const randomInteger = (min: number, max: number) => {
    return min + Math.floor(Math.random() * (max - min));
};


/** Random string of length `size`. By default can contain any alphanumeric characters - overwrite with `characters`. */
export const randomString = (size: number, characters?: string) => {
    const DEFAULT_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    characters = characters || DEFAULT_CHARACTERS;


    let result = '';

    for (let i = 0; i < size; i++) {
        result += characters[randomInteger(0, characters.length)];
    }


    return result;
};


/** Return random element from an non-empty array. Throws an error if the array is empty. */
export const randomElement = <T>(array: T[]) => {
    if (array.length === 0) {
        throw "array is empty.";
    }


    const element = array[randomInteger(0, array.length)];

    if (!element) throw "element is undefined. this should not be possible.";


    return element;
};


/**
 * List of distinct integers from min (included) to max (excluded).
 * The function keeps randomly choosing numbers until it gets a distinct number, so only use this function when n is relatively smaller than max - min.
 * `n` is the number of integers to return.
 */
export const randomIntegers = (n: number, min: number, max: number) => {
    const numbers: number[] = [];


    for (let i = 0; i < n; i++) {
        let number = randomInteger(min, max);

        while (numbers.findIndex(value => value === number) !== -1) {
            number = randomInteger(min, max);
        }


        numbers.push(number);
    }


    return numbers;
};

/**
 * List of distinct pairs from two non empty arrays.
 * The function keeps randomly choosing pairs until it gets a distinct number,
 * so only use this function when n is relatively smaller than the total number of distinct pairs.
 * `n` is the number of pairs to return.
 */
export const randomPairs = <T1, T2>(n: number, array1: T1[], array2: T2[]): [T1, T2][] => {
    if (array1.length === 0 || array2.length === 0) {
        throw "arrays must be non empty.";
    }


    return randomIntegers(n, 0, array1.length * array2.length).map(index => {
        const index1 = Math.floor(index / array2.length);
        const index2 = index % array2.length;
        return [array1[index1] as T1, array2[index2] as T2];
    });
};
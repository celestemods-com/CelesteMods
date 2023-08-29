




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


/** Return random element from array. Returns `null` if array is empty. */
export const randomElement = <T>(array: T[]) => {
    if (array.length === 0) {
        return null;
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
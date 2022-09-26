export const intMaxSizes = {
    tinyInt: {
        signed: 127 - 1,
        unsigned: 255 - 1,
    },
    smallInt: {
        signed: 32767 - 1,
        unsigned: 65535 - 1,
    },
    mediumInt: {
        signed: 8388607 - 1,
        unsigned: 16777215 - 1,
    },
    int: {
        signed: 2147483647 - 1,
        unsigned: 4294967295 - 1,
    },
    // bigInt: {
    //     signed: 9223372036854775807n - 1n,
    //     unsigned: 18446744073709551615n - 1n,
    // },
}

//the -1 on each line is intended as an extra safety measure against trimmed out-of-range numbers ever matching a valid number
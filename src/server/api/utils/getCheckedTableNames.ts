import { Prisma } from '@prisma/client';




export const getCheckedTableNames = <
    UncheckedNames extends Prisma.ModelName[],
    TableName extends Prisma.ModelName[][number] = Prisma.ModelName[][number],
    ReturnType = [TableName, ...TableName[]],
>(
    UncheckedTableNamesArray: UncheckedNames,
): ReturnType => {
    if (!UncheckedTableNamesArray.length) throw new Error("UncheckedTableNamesArray is empty");


    const prismaModelNamesArray = Object.keys(Prisma.ModelName) as Prisma.ModelName[];


    for (const tableName of UncheckedTableNamesArray) {
        if (!prismaModelNamesArray.includes(tableName)) {
            throw new Error(`Invalid table name in getCheckedTableNames: ${tableName}`);
        }
    }


    return UncheckedTableNamesArray as unknown as ReturnType;
}


// type TableNames<IsReadonly extends boolean> = IsReadonly extends true ? readonly Prisma.ModelName[] : Prisma.ModelName[];

// export const getCheckedTableNames = <
//     UncheckedNames extends (
//         readonly Prisma.ModelName[] | Prisma.ModelName[]
//     ),
//     IsReadonly extends boolean = (
//         UncheckedNames extends readonly Prisma.ModelName[] ? true : false
//     ),
//     TableName extends TableNames<IsReadonly>[number] = TableNames<IsReadonly>[number],
//     ReturnType = (
//         IsReadonly extends true ? readonly [TableName, ...TableName[]] : [TableName, ...TableName[]]
//     ),
// >(
//     UncheckedTableNamesArray: UncheckedNames,
// ): ReturnType => {
//     if (!UncheckedTableNamesArray.length) throw new Error("UncheckedTableNamesArray is empty");


//     const prismaModelNamesArray = Object.keys(Prisma.ModelName) as Prisma.ModelName[];


//     for (const tableName of UncheckedTableNamesArray) {
//         if (!prismaModelNamesArray.includes(tableName)) {
//             throw new Error(`Invalid table name in getCheckedTableNames: ${tableName}`);
//         }
//     }


//     return UncheckedTableNamesArray as unknown as ReturnType;
// }
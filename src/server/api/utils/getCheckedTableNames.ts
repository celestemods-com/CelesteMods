import { Prisma } from '@prisma/client';




export const getCheckedTableNames = <
    TableNames extends [Prisma.ModelName, ...Prisma.ModelName[]],
>(
    tableNamesArray: TableNames,
): TableNames => {
    const prismaModelNamesArray = Object.keys(Prisma.ModelName) as Prisma.ModelName[];


    for (const tableName of tableNamesArray) {
        if (!prismaModelNamesArray.includes(tableName)) {
            throw new Error(`Invalid table name in getCheckedTableNames: ${tableName}`);
        }
    }


    return tableNamesArray;
}
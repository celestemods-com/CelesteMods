import { Prisma } from '@prisma/client';




type TableNames<IsReadonly extends boolean> = IsReadonly extends true ? readonly Prisma.ModelName[] : Prisma.ModelName[];

export const getCheckedTableNames = <
    UncheckedNames extends (
        readonly Prisma.ModelName[] | Prisma.ModelName[]
    ),
    IsReadonly extends boolean = (
        UncheckedNames extends readonly Prisma.ModelName[] ? true : false
    ),
    ReturnType extends TableNames<IsReadonly> = TableNames<IsReadonly>,
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
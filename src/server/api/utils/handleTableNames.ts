import { Prisma } from "@prisma/client";
import { GetArrayElementFromMatchingArray, IfElse } from "~/utils/typeHelpers";




const tableNamesArray = Object.keys(Prisma.ModelName) as Prisma.ModelName[];
type TableNamesArray<IsReadonly> = IsReadonly extends true ? readonly Prisma.ModelName[] : Prisma.ModelName[];

export type HandleTableNames<
    AllowedTableNames extends TableNamesArray<boolean>,
    TableName extends AllowedTableNames[number],
    Payload extends any,
> = (
        Payload extends [boolean | boolean[], any[], any[]] ? (
            Payload[0] extends boolean[] ? {
                [Index in keyof Payload[1]]: IfElse<Payload[0][Index], Payload[1][Index], Payload[2][Index]>
            } : {
                [Index in keyof Payload[1]]: IfElse<Payload[0], Payload[1][Index], Payload[2][Index]>
            }
        ) : (
            Payload extends any[] | readonly any[] ?
            GetArrayElementFromMatchingArray<AllowedTableNames, TableName, Payload> :
            TableName extends AllowedTableNames ? Payload : never
        )
    )




type IncludeOrSelectObjectType = "include" | "select";

type IncludeOrSelectObject<
    ObjectType extends IncludeOrSelectObjectType,
    AllowedTableNames extends TableNamesArray<boolean>,
    TableName extends AllowedTableNames[number],
> = (
        ObjectType extends "include" ?
        { include: { [Key: TableName]: true } } :
        { select: { [Key: TableName]: true } }
    );


export type IncludeOrSelectObjects<
    ObjectType extends IncludeOrSelectObjectType,
    AllowedTableNames extends TableNamesArray<boolean>,
    TableNames extends AllowedTableNames[number][],
> = {
        [Index in keyof TableNames]: IncludeOrSelectObject<ObjectType, AllowedTableNames, TableNames[Index]>
    };
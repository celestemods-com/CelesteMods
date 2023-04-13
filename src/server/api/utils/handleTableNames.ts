import { Prisma } from "@prisma/client";
import { IfElse } from "~/utils/typeHelpers";
import { GetArrayElementFromMatchingArray, getArrayElementFromMatchingArray } from "~/utils/getArrayElementFromMatchingArray";




const tableNamesArray = Object.keys(Prisma.ModelName) as Prisma.ModelName[];
type TableNamesArray<IsReadonly> = IsReadonly extends true ? readonly Prisma.ModelName[] : Prisma.ModelName[];

export type HandleTableNames<
    AllowedTableNames extends TableNamesArray<boolean>,
    TableName extends AllowedTableNames[number],
    Payload extends any,
> = (
        Payload extends [boolean | boolean[], any[], any[]] ? (
            Payload[0] extends boolean[] ? {
                [Index in keyof Payload[1]]: Index extends number ? (
                    IfElse<Payload[0][Index], Payload[1][Index], Payload[2][Index]>
                ) : never
            } : {
                [Index in keyof Payload[1]]: Index extends number ? (
                    IfElse<Payload[0], Payload[1][Index], Payload[2][Index]>
                ) : never
            }
        ) : (
            Payload extends any[] | readonly any[] ?
            GetArrayElementFromMatchingArray<AllowedTableNames, TableName, Payload> :
            TableName extends AllowedTableNames ? Payload : never
        )
    );




type IncludeOrSelectObjectType = "include" | "select";
type IncludeOrSelectObject = Record<string, boolean | { select: Record<string, boolean> }>;
type IncludeOrSelectPayload = (string | [string, string[]])[];


type CreateIncludeOrSelectObject<
    Payload extends IncludeOrSelectPayload
> = {
        [Key in Payload[number]as (
            Key extends string ? Key : (
                Key extends [string, string[]] ?
                Key[0] :
                never
            )
        )]: (
            Key extends string ? true : (
                Key extends [string, string[]] ? {
                    select: {
                        [Index in Key[1][number]]: true
                    }
                } : never
            )
        )
    }


const createIncludeOrSelectObject = <
    IncludePayload extends IncludeOrSelectPayload,
    ReturnType extends { include: CreateIncludeOrSelectObject<IncludePayload> },
>(
    includePayload: IncludePayload,
) => {

}


export const getIncludeOrSelectObject = <
    ObjectType extends IncludeOrSelectObjectType,
    AllowedTableNames extends TableNamesArray<boolean>,
    TableName extends AllowedTableNames[number],
    IncludePayload extends IncludeOrSelectPayload[],
    SelectPayload extends IncludeOrSelectPayload[],
    ReturnType extends (
        HandleTableNames<
            AllowedTableNames,
            TableName,
            (
                ObjectType extends "include" ?
                { include: IncludeObject } :
                { select: SelectObject }
            )
        >
    ),
>(
    objectType: ObjectType,
    allowedTableNames: AllowedTableNames,
    tableName: TableName,
    includePayloadArray: IncludePayload,
    selectPayloadArray: SelectPayload,
): ReturnType => {
    const selectedPayloadArray = objectType === "include" ? includePayloadArray : selectPayloadArray;

    const selectedPayload = getArrayElementFromMatchingArray(allowedTableNames, tableName, selectedPayloadArray);



}
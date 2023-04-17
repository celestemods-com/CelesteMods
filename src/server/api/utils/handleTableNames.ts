import { Prisma } from "@prisma/client";
import { IfElse } from "~/utils/typeHelpers";
import { GetArrayElementFromMatchingArray } from "~/utils/getArrayElementFromMatchingArray";
import { ExpandedMod, ExpandedModArchive, TrimmedMod, TrimmedModArchive } from "../routers/map_mod_publisher/mod";




export type HandleTableNames<
    AllowedTableNames extends Prisma.ModelName[],
    TableName extends AllowedTableNames[number],
    Payload extends any,
> = (
        Payload extends [boolean | boolean[], any[], any[]] ? (
            Payload[0] extends boolean[] ? {
                [Index in keyof Payload[1]]: Index extends number ? (
                    IfElse<Payload[0][Index], Payload[1][Index], Payload[2][Index]>
                ) : never
            }[keyof Payload[1]] : {
                [Index in keyof Payload[1]]: Index extends number ? (
                    IfElse<Payload[0], Payload[1][Index], Payload[2][Index]>
                ) : never
            }[keyof Payload[1]]
        ) : (
            Payload extends [boolean, any, ...any[]] ? (
                Payload[1] extends any[] ? (
                    Payload[2] extends any[] ? (
                        GetArrayElementFromMatchingArray<AllowedTableNames, TableName, Payload>
                    ) : never
                ) : (
                    Payload[2] extends any[] ? (
                        never
                    ) : (
                        IfElse<Payload[0], Payload[1], Payload[2]>
                    )
                )
            ) : (
                Payload extends any[] ? (
                    GetArrayElementFromMatchingArray<AllowedTableNames, TableName, Payload>
                ) : (
                    TableName extends AllowedTableNames[number] ? Payload : never
                )
            )
        )
    );


type t = HandleTableNames<["Mod", "Mod_Archive", "Mod_Edit", "Mod_New"], "Mod", [Prisma.ModCreateArgs, Prisma.Mod_ArchiveCreateArgs, Prisma.Mod_EditCreateArgs, Prisma.Mod_NewCreateArgs,]>;
//   ^?




// type IncludeOrSelectObjectType = "include" | "select";
// type IncludeOrSelectObject = Record<string, boolean | { select: Record<string, boolean> }>;
// type IncludeOrSelectPayload = (string | [string, string[]])[];


// type CreateIncludeOrSelectObject<
//     Payload extends IncludeOrSelectPayload
// > = {
//         [Key in Payload[number]as (
//             Key extends string ? Key : (
//                 Key extends [string, string[]] ?
//                 Key[0] :
//                 never
//             )
//         )]: (
//             Key extends string ? true : (
//                 Key extends [string, string[]] ? {
//                     select: {
//                         [Index in Key[1][number]]: true
//                     }
//                 } : never
//             )
//         )
//     }


// const createIncludeOrSelectObject = <
//     IncludePayload extends IncludeOrSelectPayload,
//     ReturnType extends { include: CreateIncludeOrSelectObject<IncludePayload> },
// >(
//     includePayload: IncludePayload,
// ) => {

// }


// export const getIncludeOrSelectObject = <
//     ObjectType extends IncludeOrSelectObjectType,
//     AllowedTableNames extends TableNamesArray<boolean>,
//     TableName extends AllowedTableNames[number],
//     IncludePayload extends IncludeOrSelectPayload[],
//     SelectPayload extends IncludeOrSelectPayload[],
//     ReturnType extends (
//         HandleTableNames<
//             AllowedTableNames,
//             TableName,
//             (
//                 ObjectType extends "include" ?
//                 { include: IncludeObject } :
//                 { select: SelectObject }
//             )
//         >
//     ),
// >(
//     objectType: ObjectType,
//     allowedTableNames: AllowedTableNames,
//     tableName: TableName,
//     includePayloadArray: IncludePayload,
//     selectPayloadArray: SelectPayload,
// ): ReturnType => {
//     const selectedPayloadArray = objectType === "include" ? includePayloadArray : selectPayloadArray;

//     const selectedPayload = getArrayElementFromMatchingArray(allowedTableNames, tableName, selectedPayloadArray);



// }
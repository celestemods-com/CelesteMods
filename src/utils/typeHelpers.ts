type AND<
    B1 extends boolean,
    B2 extends boolean,
> = B1 extends true ? (
    B2 extends true ? true : false
) : false;

type OR<
    B1 extends boolean,
    B2 extends boolean,
> = B1 extends false ? (
    B2 extends false ? false : true
) : true;




type NotArray<T = any> = T extends any[] ? never : T;




export type IfElse<Bool, True, False> = Bool extends true ? True : False;


/** 
 * Array.length must never be zero.
 * If Bool and Payload are both arrays, they must be the same length.
 * */
export type IfElseOnCandidateArrays<
    Bool extends boolean | boolean[],
    Payload extends [any, any] | [any, any][],
> = Bool extends boolean ? (
    Payload extends [NotArray, NotArray] ? (
        IfElse<Bool, Payload[0], Payload[1]>
    ) : (
        IsNonEmptyArray<Payload> extends false ? {  //ensures Payload is not empty
            [Index in keyof Payload]: Index extends number ? (
                IfElse<Bool, Payload[Index][0], Payload[Index][1]>
            ) : never
        } : never
    )
) : (
        AND<IsNonEmptyArray<Bool>, IsNonEmptyArray<Payload>> extends true ? {   //ensures neither array is empty
            [Index in keyof Bool]: Index extends number ? (
                IfElse<Bool[Index], Payload[Index][0], Payload[Index][1]>
            ) : never
        } : never
    );


export type ArrayIncludes<
    Value,
    Array extends any[],
> = Array extends [infer Element, ...infer Rest] ? (
    Element extends Value ?
    Value :
    ArrayIncludes<Value, Rest>
) : never;


export type ReturnTypeOfKnownArray<
    T extends (
        U extends undefined ? any[] : U
    ),
    U extends any[] | undefined = undefined
> = T extends [...infer R] ? R : never;


type ArrayLength<T extends any[]> = T["length"];

/** FallbackLength is ignored if T is an array */
type PossibleArrayLength<
    T extends any,
    FallbackLength extends number | undefined = undefined,
> = (
        T extends any[] ?
        T["length"] :
        FallbackLength
    );


export type IsNonEmptyArray<T> = T extends any[] ? (
    T["length"] extends 0 ?
    false :
    true
) : false;

export type NonEmptyArray<T> = IsNonEmptyArray<T> extends true ? T : never;
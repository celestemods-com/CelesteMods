export type IfElse<Boolean, True, False> = Boolean extends true ? True : False;




export type ArrayIncludes<
    Value,
    Array extends any[],
> = Array extends [infer Element, ...infer Rest] ?
    (
        Element extends Value ?
        Value :
        ArrayIncludes<Value, Rest>
    ) :
    never;





export type ReturnTypeOfKnownArray<
    T extends (
        U extends undefined ? any[] : U
    ),
    U extends any[] | undefined = undefined
> = T extends [...infer R] ? R : never;
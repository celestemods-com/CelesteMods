
/** Both arrays must be the same non-zero length */
export type GetArrayElementFromMatchingArray<
    MainArray extends MainConstraint[] | readonly MainConstraint[],
    MainArrayElement extends MainArray[number],
    MatchingArray extends MatchingConstraint[] | readonly MatchingConstraint[],
    MainConstraint extends any = any,
    MatchingConstraint extends any = any,
> = (
        MainArray["length"] extends 0 ? never : (
            MainArray["length"] extends MatchingArray["length"] ? (
                MainArray extends [
                    infer MainElement extends MainConstraint,
                    ...infer MainRest extends MainConstraint[]
                ] ? (
                    MatchingArray extends [
                        infer MatchingElement extends MatchingConstraint,
                        ...infer MatchingRest extends MatchingConstraint[]
                    ] ? (
                        MainElement extends MainArrayElement ?
                        MatchingElement :
                        GetArrayElementFromMatchingArray<MainRest, MainArrayElement, MatchingRest, MainConstraint, MatchingConstraint>
                    ) : never
                ) : never
            ) : never
        )
    );




export const getArrayElementFromMatchingArray = <
    MainArray extends any[] | readonly any[],
    MainArrayElement extends MainArray[number],
    MatchingArray extends any[] | readonly any[],
    ReturnType extends GetArrayElementFromMatchingArray<MainArray, MainArrayElement, MatchingArray>,
>(
    mainArray: MainArray,
    mainArrayElement: MainArrayElement,
    matchingArray: MatchingArray,
): ReturnType => {
    if (!mainArray.length) {
        throw new Error("mainArray must not be empty");
    }

    if (mainArray.length !== matchingArray.length) {
        throw new Error("mainArray and matchingArray must be the same length");
    }


    const mainArrayElementIndex = mainArray.indexOf(mainArrayElement);

    if (mainArrayElementIndex === -1) {
        throw new Error("mainArrayElement must be in mainArray");
    }


    return matchingArray[mainArrayElementIndex];
};
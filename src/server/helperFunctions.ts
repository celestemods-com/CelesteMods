import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getNonEmptyArray } from "~/utils/typeHelpers";




const sortOrders = getNonEmptyArray(Prisma.SortOrder);


const getSortOrderSchema = <
    DefaultDirections extends typeof sortOrders,
>(
    defaultDirections: DefaultDirections,
) => {
    return z.object({
        directions: z.enum(sortOrders).array().nonempty().default(defaultDirections),
    }).strict();
}


const getSortBySchema = <
    SelectorArray extends [string, ...string[]],
    DefaultSelectorArray extends [SelectorArray[number], ...SelectorArray[number][]],
>(
    selectors: SelectorArray,
    defaultSelectors: DefaultSelectorArray,
) => {
    return z.object({
        selectors: z.enum(selectors).array().nonempty().default(defaultSelectors),
    }).strict();
}


export const getCombinedSchema = <
    SelectorArray extends [string, ...string[]],
    DefaultSelectorArray extends [SelectorArray[number], ...SelectorArray[number][]],
    DefaultDirections extends typeof sortOrders,
>(
    selectors: SelectorArray,
    defaultSelectors: DefaultSelectorArray,
    defaultDirections: DefaultDirections,
) => {
    // const t = getSortBySchema(selectors, defaultSelectors).merge(getSortOrderSchema(defaultDirections));
    // let y: z.infer<typeof t> = { so };     //TODO: why is sortBy optional and sortOrder isnt?


    const sortBySchema = getSortBySchema(selectors, defaultSelectors);
    const sortOrderSchema = getSortOrderSchema(defaultDirections);

    return sortBySchema.merge(sortOrderSchema);
}


export const getOrderObject = <
    SelectorArray extends [string, ...string[]],
    DirectionsArray extends [Prisma.SortOrder, ...Prisma.SortOrder[]],
>(
    selectors: SelectorArray,
    directions: DirectionsArray,
) => {
    const orderObject = {};


    if (!selectors.length) throw "selectors is empty";


    if (selectors.length === directions.length) {
        for (let index = 0; index < selectors.length; index++) {
            const selector = selectors[index];
            const order = directions[index];

            if (!selector || !order) throw "a value is undefined in getOrderObject section 1";

            //@ts-ignore    //TODO: figure out how to fix type error without using escape hatch
            orderObject[selector] = order;  // No index signature with a parameter of type 'string' was found on type '{}'.
        }
    }
    else {
        if (directions.length !== 1) throw "directions.length does not match selectors.length";

        const order = directions[0];

        for (let index = 0; index < selectors.length; index++) {
            const selector = selectors[index];

            if (!selector || !order) throw "a value is undefined in getOrderObject section 2";

            //@ts-ignore    //TODO: figure out how to fix type error without using escape hatch
            orderObject[selector] = order;  // No index signature with a parameter of type 'string' was found on type '{}'.
        }
    }


    return orderObject;
}
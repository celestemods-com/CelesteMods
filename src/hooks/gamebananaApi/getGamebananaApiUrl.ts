import type { GamebananaModId } from "~/components/mods/types";
import { type GamebananaItemType, GAMEBANANA_API_BASE_URL } from "./typesAndConsts";




export type GetGamebananaApiUrlProps<
    ReturnType extends boolean,
> = {
    itemType: GamebananaItemType;
    itemId: GamebananaModId | undefined;
    fields: string | string[];
    returnKeys?: ReturnType;
};




export const getGamebananaApiUrl = <
    ReturnKeys extends boolean,
>(
    {
        itemType,
        itemId,
        fields,
        returnKeys = false as ReturnKeys,
    }: GetGamebananaApiUrlProps<ReturnKeys>,
): string => {
    //get fieldsString
    const fieldsString = typeof fields === "string" ? fields : fields.join(",");

    //get query url
    const queryUrl = itemId === undefined ?
        "" :
        `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}`;

    return queryUrl;
};
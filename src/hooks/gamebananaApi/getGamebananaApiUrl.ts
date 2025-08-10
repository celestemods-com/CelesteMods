import type { GamebananaModId } from "~/components/mods/types";
import { type GamebananaItemType, GAMEBANANA_API_BASE_URL, GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER } from "./typesAndConsts";




export type GetGamebananaApiUrlProps = {
    itemType: GamebananaItemType;
    itemId: GamebananaModId | undefined;
	fieldType: string;
    field: string; //| string[];
};




export const getGamebananaApiUrl = (
    {
        itemType,
        itemId,
		fieldType,
        field,
    }: GetGamebananaApiUrlProps,
): string => {
    //get fieldsString
    // const fieldsString = typeof fields === "string" ? fields : fields.join(",");

    //get query url
    const queryUrl = itemId === undefined ?
        "" :
        `https://${GAMEBANANA_API_BASE_URL}/${itemType}/${itemId}?${fieldType}=${field}`;

    return queryUrl;
};
import { useEffect, useState } from "react";
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




// Unused

export const useGamebananaApiUrl = <
    ReturnType extends boolean
>(
    {
        itemType,
        itemId,
        fields,
        returnKeys = false as ReturnType,
    }: GetGamebananaApiUrlProps<ReturnType>,
) => {
    //get fieldsString
    const [fieldsString, setFieldsString] = useState<string>("");

    useEffect(() => {
        if (typeof fields === "string") setFieldsString(fields);
        else setFieldsString(fields.join(","));
    }, [fields]);


    //get query url
    const [queryUrl, setQueryUrl] = useState<string>("");

    useEffect(() => {
        const url = itemId === undefined ?
            "" :
            `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}`;

        setQueryUrl(url);
    }, [itemType, itemId, fieldsString, returnKeys]);


    return { queryUrl };
};




export const getGamebananaApiUrl = <
    ReturnType extends boolean,
>(
    {
        itemType,
        itemId,
        fields,
        returnKeys = false as ReturnType,
    }: GetGamebananaApiUrlProps<ReturnType>,
): string => {
    //get fieldsString
    const fieldsString = typeof fields === "string" ? fields : fields.join(",");

    //get query url
    const queryUrl = itemId === undefined ?
        "" :
        `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}`;

    return queryUrl;
};
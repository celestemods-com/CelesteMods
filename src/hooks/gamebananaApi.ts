import { useState } from "react";
import useFetch from "react-fetch-hook";

export type GamebananaApiResponse = string[];


const GAMEBANANA_API_BASE_URL = "https://api.gamebanana.com/Core/Item/Data";




const GAMEBANANA_ITEM_TYPES = ["Mod"] as const;

export type GamebananaItemType = typeof GAMEBANANA_ITEM_TYPES[number];


const GAMEBANANA_MOD_FIELDS = [
    "date",
    "screenshot",
] as const;

const GAMEBANANA_ITEM_FIELDS: {
    [ItemType in GamebananaItemType]: readonly string[];
} = {
    Mod: GAMEBANANA_MOD_FIELDS,
};

type GamebananaItemFields<      //TODO!!!: make this work then continue below
    ItemType extends GamebananaItemType
> = typeof GAMEBANANA_ITEM_FIELDS[ItemType];

type t = GamebananaItemFields<"Mod">;

export const getGamebananaItemFields = <
    ItemType extends GamebananaItemType,
    Fields extends GamebananaItemFields<ItemType>,
>(
    itemType: ItemType,
    fields: Fields,
) => {
    //TODO!!: continue here after above is fixed
};


type GetGamebananaApiUrlProps = {      //TODO: update this to encode narrower types based on itemType
    itemType: GamebananaItemType;
    itemId: number;
    fields: string | string[];
    returnKeys?: boolean;
};


export const useGamebananaApiUrl = (
    {
        itemType,
        itemId,
        fields,
        returnKeys = false,
    }: GetGamebananaApiUrlProps
) => {
    const fieldsString = typeof fields === "string" ? fields : fields.join(",");


    return `https://${GAMEBANANA_API_BASE_URL}?itemtype=${itemType}&itemid=${itemId}&fields=${fieldsString}${returnKeys ? "&return_keys=true" : ""}}`;
};




type UseGamebananaModImageUrlsProps = {
    gamebananaModId: number;
};


const GAMEBANANA_MOD_IMAGES_BASE_URL = "https://images.gamebanana.com/img/ss/mods/";


export const useGamebananaModImageUrls = ({ gamebananaModId }: UseGamebananaModImageUrlsProps): number[] => {
    const queryUrl = useGamebananaApiUrl({
        itemType: "Mod",
        itemId: gamebananaModId,
        fields: "date",
    });


    //get image urls
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const publicationDateQuery = useFetch<GamebananaApiResponse>(queryUrl, { depends: [gamebananaModId] });    //TODO!: implement caching
};
// import type { Mod } from "~/components/mods/types";




export const GAMEBANANA_API_BASE_URL = "api.gamebanana.com/Core/Item/Data" as const;

export const GAMEBANANA_API_ERROR_STRING = "GameBanana API not responding as expected." as const;




// type GamebananaModId = Mod["gamebananaModId"];

export type GamebananaApiResponse<
    ReturnKeys extends boolean,
    Key extends string = (
        ReturnKeys extends true ?
        string :
        never
    ),
    ReturnType = unknown,
> = (
        ReturnKeys extends true ?
        Record<Key, ReturnType> :
        ReturnType[]
    );




const GAMEBANANA_ITEM_TYPES = ["Mod"] as const;

export type GamebananaItemType = typeof GAMEBANANA_ITEM_TYPES[number];


// const GAMEBANANA_MOD_FIELDS = [
//     "date",
//     "screenshots",
// ] as const;

// const GAMEBANANA_ITEM_FIELDS: {
//     [ItemType in GamebananaItemType]: readonly string[];
// } = {
//     Mod: GAMEBANANA_MOD_FIELDS,
// };

// type GamebananaItemFields<      //TODO: make this work then continue below
//     ItemType extends GamebananaItemType
// > = typeof GAMEBANANA_ITEM_FIELDS[ItemType];

// export const getGamebananaItemFields = <
//     ItemType extends GamebananaItemType,
//     Fields extends GamebananaItemFields<ItemType>,
// >(
//     itemType: ItemType,
//     fields: Fields,
// ) => {
//     //TODO!!: continue here after above is fixed
// };
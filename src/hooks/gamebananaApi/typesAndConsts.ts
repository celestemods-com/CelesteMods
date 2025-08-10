// import type { Mod } from "~/components/mods/types";




export const GAMEBANANA_API_BASE_URL = "gamebanana.com/apiv11" as const;

export const GAMEBANANA_API_ERROR_STRING = "GameBanana API not responding as expected." as const;




// type GamebananaModId = Mod["gamebananaModId"];

export type GamebananaApiResponse = Record<string, Record<string, unknown>[]>;




export const GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER = "Mod" as const;

const GAMEBANANA_ITEM_TYPES = [
	GAMEBANANA_API_ITEM_TYPE_MODS_IDENTIFIER,
] as const;

export type GamebananaItemType = typeof GAMEBANANA_ITEM_TYPES[number];


export const GAMEBANANA_MOD_METADATA_FIELDS_TYPE = "_csvProperties" as const;


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
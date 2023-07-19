import { TrimmedMod } from "~/server/api/routers/map_mod_publisher/mod";
import { RouterOutputs } from "~/utils/api";




// export type Mod = RouterOutputs["mod"]["getById"];       //TODO: figure out how to narrow this and use instead of next line

export type Mod = {
    isExpanded: boolean;
} & TrimmedMod;


export type Map = RouterOutputs["map"]["getById"];


export type ModRatingData = RouterOutputs["rating"]["getModRatingData"];
export type MapRatingData = RouterOutputs["rating"]["getMapRatingData"];
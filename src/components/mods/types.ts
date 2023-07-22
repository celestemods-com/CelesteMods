import { TrimmedMod } from "~/server/api/routers/map_mod_publisher/mod";
import { RatingsInfo } from "~/server/api/routers/rating";
import { RouterOutputs } from "~/utils/api";




// export type Mod = RouterOutputs["mod"]["getById"];       //TODO: figure out how to narrow this and use instead of next line

export type Mod = {
    isExpanded: boolean;
} & TrimmedMod;


export type Map = RouterOutputs["map"]["getById"];


export type ModRatingData = RouterOutputs["rating"]["getModRatingData"];

export type MapRatingData = RouterOutputs["rating"]["getMapRatingData"];
export type MapNoRatingData = Pick<MapRatingData, "mapId">;
export type MapYesRatingData = {    //TODO: figure out how to do this through narrowing instead of directly referencing the type
    mapId: MapRatingData["mapId"];
} & RatingsInfo


export type Quality = RouterOutputs["quality"]["getAll"][number];
export type Difficulty = RouterOutputs["difficulty"]["getAll"][number];
export type Length = RouterOutputs["length"]["getAll"][number];
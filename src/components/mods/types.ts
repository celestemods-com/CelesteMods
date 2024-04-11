import { TrimmedMod } from "~/server/api/routers/map_mod_publisher/mod";
import { RatingsInfo } from "~/server/api/routers/rating";
import { RouterOutputs } from "~/utils/api";




// export type Mod = RouterOutputs["mod"]["getById"];       //TODO: figure out how to narrow this and use instead of next line

export type Mod = {
    isExpanded: boolean;
} & TrimmedMod;

export type ModRatingData = RouterOutputs["rating"]["getModRatingData"];
export type ModNoRatingData = Pick<ModRatingData, "modId">;
export type ModYesRatingData = {    //TODO: figure out how to do this through narrowing instead of directly referencing the type
    modId: ModRatingData["modId"];
} & RatingsInfo;


export type Map = RouterOutputs["map"]["getById"];

export type MapRatingData = RouterOutputs["rating"]["getMapRatingData"];
export type MapNoRatingData = Pick<MapRatingData, "mapId">;
export type MapYesRatingData = {    //TODO: figure out how to do this through narrowing instead of directly referencing the type
    mapId: MapRatingData["mapId"];
} & RatingsInfo;


export type Quality = RouterOutputs["quality"]["getAll"][number];
export type Difficulty = RouterOutputs["difficulty"]["getAll"][number];
export type Publisher = RouterOutputs["publisher"]["getAll"][number];
export type Tech = RouterOutputs["tech"]["getAll"][number];
export type Length = RouterOutputs["length"]["getAll"][number];




type RatingInfo = {
    id: number;
    name: string;
    count: number;
};

export type MapWithTechInfo = {
    TechsAny: Tech[];
    TechsFC: Tech[];
} & Omit<Map, "MapToTechs">;

export type MapWithTechAndRatingInfo = {
    lengthName: string,
    overallCount: number,
    qualityName: string,
    qualityCount: number,
    difficultyName: string,
    difficultyCount: number,
    chapterSide?: string;
} & MapWithTechInfo;


export type ModWithInfo = {
    overallCount: number;
    /** should only be defined if there are no difficulty ratings */
    lowestCannonicalDifficulty: number | undefined;
    Quality: RatingInfo;
    Difficulty: RatingInfo;
    mapCount: number;
    MapsWithTechInfo: MapWithTechInfo[];
    publisherName: Publisher["name"];
    TechsAny: Tech["name"][];
    TechsFC: Tech["name"][];
} & Omit<Mod, "Map">;
import { difficultyNamesArray } from "../helperFunctions/handleDbImport";
import { createDifficultyData, createUserData } from "../../../express-backend/src/types/internal";
import { users } from "@prisma/client";




export interface DbImportJSON {
    difficulties: Difficulty[];
    subDifficulties: NameAndDescription[];
    qualities: NameAndDescription[];
    lengths: NameAndDescription[];
    maps: Maps;
    publishers: Publisher[];
    discordTags: string[];
    ratings: Ratings;
}


export type DifficultyNames = typeof difficultyNamesArray[number];


export interface NameAndDescription {
    name: string;
    description: string;
}

export interface Difficulty extends NameAndDescription {
    name: DifficultyNames;
    techs: string;
}

export interface Publisher {
    name: string;
    publisherGamebananaID: number;
}


export interface Maps {
    Beginner: Map[];
    Intermediate: Map[];
    Advanced: Map[];
    Expert: Map[];
    Grandmaster: Map[];
}

export interface Map {
    modName: string;
    oldCmlPublisherName: string;
    length: string;
    techList: string;
    description: string;
    oldDescription: string;
    gamebananaModID: number;
    publisherName: string;
    publisherGamebananaID: number;
    timeCreated: number;
}



export interface Ratings {
    [key: DifficultyNames]: RatingsForDifficultyName;
}

export interface RatingsForDifficultyName {
    [key: string]: RatingsForMap;
}

export interface RatingsForMap {
    [key: string]: {
        qualityRating: number;
        relativeDifficultyRating: number;
    }
}




export interface CreateDifficultyDataForImport extends createDifficultyData {
    id: number;
}

export interface CreateTechDataForImport {
    id: number;
    name: string;
    description?: string | null;
    techVideos?: { create: createTechVideosData[] };
    defaultDifficultyID: number;
}

export interface CreateUserDataForImport extends createUserData {
    id: number;
    discordID: null;
}
import { difficultyNamesArray } from "../helperFunctions/handleDbImport";
import { createDifficultyData, createUserData } from "../../../express-backend/src/types/internal";
import { users } from "@prisma/client";




export interface DbImportJSON {
    difficulties: Difficulty[];
    subDifficulties: NameAndDescription[];
    qualities: NameAndDescription[];
    lengths: NameAndDescription[];
    mods: Mods;
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


export interface Mods {
    Beginner: string[];
    Intermediate: string[];
    Advanced: string[];
    Expert: string[];
    Grandmaster: string[];
    UniqueMods: {
        [key: number]: Mod;     //keys are gamebananaModIDs
    };
}

export interface Mod {
    oldCmlModName: string[];
    oldCmlPublisherName: string[];
    length: string[];
    techAny?: string;
    techFC?: string;
    description: string[];
    oldDescription: string[];
    publisherName: string;
    publisherGamebananaID: number;
    timeCreated: number;
    gamebananaModName: string;
}



export interface Ratings {
    [key: DifficultyNames]: RatingsForDifficultyName;
}

export interface RatingsForDifficultyName {
    [key: string]: RatingsForMod;
}

export interface RatingsForMod {
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
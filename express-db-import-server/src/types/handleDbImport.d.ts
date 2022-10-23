export interface DbImportJSON {
    difficulties: Difficulty[];
    subDifficulties: NameAndDescription[];
    qualities: NameAndDescription[];
    lengths: NameAndDescription[];
    maps: Maps;
    discordTags: string[];
    ratings: Ratings;
}


export type DifficultyNames = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Grandmaster";


interface NameAndDescription {
    name: string;
    description: string;
}

interface Difficulty extends NameAndDescription {
    techs: string;
}


interface Maps {
    [key: DifficultyNames]: Map;
}

interface Map {
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



interface Ratings {
    [key: DifficultyNames]: RatingsForDifficultyName;
}

interface RatingsForDifficultyName {
    [key: string]: RatingsForMap;
}

interface RatingsForMap {
    [key: string]: {
        qualityRating: number;
        relativeDifficultyRating: number;
    }
}
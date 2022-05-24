import { prisma } from "../prismaClient";

import { ratings, difficulties } from "@prisma/client";
import { rawRating } from "../types/internal";
import { formattedRating, ratingsInfo } from "../types/frontend";
import { isErrorWithMessage, toErrorWithMessage } from "../errorHandling";




export const formatRatings = function ( rawRatings: rawRating[]) {
    const formattedRatings = rawRatings.map((rawRating) => {
        const formattedRating = formatRating(rawRating);

        if (isErrorWithMessage(formattedRating)) return `Error encountered formatting rating ${rawRating.id}`;

        return formattedRating;
    });


    return formattedRatings;
}


export const formatRating = function (rawRating: rawRating) {
    try {
        const id = rawRating.id;
        const mapID = rawRating.mapID;
        const submittedBy = rawRating.submittedBy;
        const timeSubmitted = rawRating.timeSubmitted;
        const quality = !rawRating.quality ? undefined : rawRating.quality;


        const formattedRating: formattedRating = {
            id: id,
            mapID: mapID,
            submittedBy: submittedBy,
            timeSubmitted: timeSubmitted,
            quality: quality,
        }


        let difficultyIDsArray: number[] | undefined;

        if (rawRating.difficulties) {
            const parentDifficultyID = rawRating.difficulties.parentDifficultyID;
            const childDifficultyID = rawRating.difficulties.id;

            if (!parentDifficultyID) throw `difficulty ${childDifficultyID} used in rating ${id} has no parentDifficultyID`;


            formattedRating.difficulty = [parentDifficultyID, childDifficultyID];
        }


        return formattedRating;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const getRatingsInfo = async function (ratings: ratings[]) {
    const difficultyValuesMap = await getDifficultyValuesMap();


    let qualityCount = 0;
    let qualitySum = 0;
    let difficultyCount = 0;
    let difficultySum = 0;


    for (const rating of ratings) {
        let hasValuesBool = false;


        if (rating.quality) {
            hasValuesBool = true;

            qualityCount++;
            qualitySum += rating.quality;
        }


        if (rating.difficultyID) {
            hasValuesBool = true;
            
            const difficultyValue = difficultyValuesMap.get(rating.difficultyID);

            if (!difficultyValue) throw `undefined difficultyValue for difficulty ${rating.difficultyID} from rating ${rating.id}`;

            difficultyCount++;
            difficultySum += difficultyValue;
        }


        if (!hasValuesBool) throw `rating ${rating.id} has no values`;
    }

    
    const overallCount = ratings.length;
    const unroundedAverageQuality = !qualityCount ? undefined : qualitySum / qualityCount;
    const unroundedAverageDifficultyValue = !difficultySum ? undefined : difficultySum / difficultyCount;
    const averageDifficultyID = !unroundedAverageDifficultyValue ? undefined : getAverageDifficultyID(difficultyValuesMap, unroundedAverageDifficultyValue);


    let roundedAverageQuality = undefined;
    let roundedAverageDifficultyValue = undefined;

    if (unroundedAverageQuality) {
        roundedAverageQuality = Math.round(unroundedAverageQuality * 10) / 10;
    }

    if (unroundedAverageDifficultyValue) {
        roundedAverageDifficultyValue = Math.round(unroundedAverageDifficultyValue * 10) / 10;
    }


    const ratingsInfo: ratingsInfo = {
        averageQuality: roundedAverageQuality,
        averageDifficultyID: averageDifficultyID,
        averageDifficultyValue: roundedAverageDifficultyValue,
        overallCount: overallCount,
        qualityCount: qualityCount,
        difficultyCount: difficultyCount,
    }


    return ratingsInfo;
}


const getDifficultyValuesMap = async function () {
    const rawDifficulties = await prisma.difficulties.findMany({
        where: {
            AND: {
                parentModID: null,
            },
        },
        orderBy: [
            { parentDifficultyID: "asc" },
            { order: "asc" },
        ],
        include: { other_difficulties: true },
    });

    if (!rawDifficulties.length) throw "no child default difficulties";


    const nestedDifficultiesArray: (difficulties & { other_difficulties: difficulties[] })[][] = [];

    for (const difficulty of rawDifficulties) {
        /*
        all parent difficulties should be at the beginning of the array, so all child arrays in nestedDifficultiesArray 
        should be created before encountering any child difficulties
        */
        if (difficulty.parentDifficultyID === null) {
            nestedDifficultiesArray.push([difficulty]);
            continue;
        }

        const parentDifficultyOrder = difficulty.other_difficulties[0].order;

        nestedDifficultiesArray[parentDifficultyOrder].push(difficulty);
    }


    const difficultyValuesMap: Map<number, number> = new Map();  //Map with difficulty IDs as the keys

    for (const childDifficultiesArray of nestedDifficultiesArray) {
        //the +1 means the last child will not reach the next whole number value. this is intentional to add greater weight to going up a difficulty tier.
        const valueIncrement = 1 / (childDifficultiesArray.length + 1);
        let difficultyValue = childDifficultiesArray[0].other_difficulties[0].order - 1;

        for (const childDifficulty of childDifficultiesArray) {
            difficultyValue += valueIncrement;

            difficultyValuesMap.set(childDifficulty.id, difficultyValue);
        }
    }


    return difficultyValuesMap;
}


const getAverageDifficultyID = function (difficultyValuesMap: Map<number, number>, averageDifficultyValue: number) {
    let lowerBoundValue = 0;
    let lowerBoundID = 0;
    let upperBoundValue = 999;
    let upperBoundID = 0;

    for (const entry of difficultyValuesMap.entries()) {
        const id = entry[0];
        const value = entry[1];

        if (value === averageDifficultyValue) return id;

        if (value < averageDifficultyValue) {
            if (value > lowerBoundValue) {
                lowerBoundValue = value;
                lowerBoundID = id;
            }
        }
        else {  //if this block is reached, value must be greater than averageDifficultyValue
            if (value < upperBoundValue) {
                upperBoundValue = value;
                upperBoundID = id;
            }
        }
    }


    const lowerBoundDifference = averageDifficultyValue - lowerBoundValue;
    const upperBoundDifference = upperBoundValue - averageDifficultyValue;

    let averageDifficultyID;

    if (upperBoundDifference <= lowerBoundDifference) averageDifficultyID = upperBoundID;
    else averageDifficultyID = lowerBoundID;


    return averageDifficultyID;
}
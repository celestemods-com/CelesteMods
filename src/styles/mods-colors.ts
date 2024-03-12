import { difficultyColors } from "./difficultyColors";

const listOfColors = [
    difficultyColors.beginner,
    difficultyColors.intermediate,
    difficultyColors.advanced,
    difficultyColors.expert,
    difficultyColors.grandmaster,
];


export const greatestValidDifficultyIndex = listOfColors.length - 1;




export function colorsForDifficultyIndex(difficultyIndex: number | null) {
    const validDifficultyIndex = (difficultyIndex === null || difficultyIndex > greatestValidDifficultyIndex) ? greatestValidDifficultyIndex : difficultyIndex;


    const colors = listOfColors[validDifficultyIndex];

    if (!colors) {
        throw "colors is undefined";
    }


    return colors;
}
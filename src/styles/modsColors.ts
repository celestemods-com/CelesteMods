import { canonicalDifficultyNames, difficultyColors, type DifficultyColorsObjects } from "./difficultyColors";




/** Easiest to hardest.
 * Must be in the same order as the `canonicalDifficultyNames` array in `./difficultyColors.ts`.
 */
const listOfColors: DifficultyColorsObjects[] = [];

for (let index = 0; index < canonicalDifficultyNames.length; index++) {
    const difficultyName = canonicalDifficultyNames[index];

    if (!difficultyName) throw "difficultyName is undefined";


    const difficultyColor = difficultyColors[difficultyName];

    if (!difficultyColor) {
        throw "difficultyColor is undefined";
    }


    listOfColors.push(difficultyColor);
}


export const greatestValidDifficultyIndex = listOfColors.length - 1;




export function colorsForDifficultyIndex(difficultyIndex: number | null) {
    const validDifficultyIndex = (difficultyIndex === null || difficultyIndex > greatestValidDifficultyIndex) ? greatestValidDifficultyIndex : difficultyIndex;


    const colors = listOfColors[validDifficultyIndex];

    if (!colors) {
        throw "colors is undefined";
    }


    return colors;
}
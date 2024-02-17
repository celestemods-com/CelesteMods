export const difficultyColors = {
    beginner: {
        primary: "#263972",
        primaryHover1: "#576ba9",
        primaryHover2: "#6a86b9",
        secondary: "#5e79ca",
        secondaryHover: "#798fd3",
        secondaryDisabled: "#0f172e",
    },
    intermediate: {
        primary: "#0b6aba",
        primaryHover1: "#2a83c8",
        primaryHover2: "#3f9bd2",
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
        secondaryDisabled: "#1f4869",
    },
    advanced: {
        primary: "#413a98",
        primaryHover1: "#605bba",
        primaryHover2: "#776fd2",
        secondary: "#6a66c6",
        secondaryHover: "#9b98d2",
        secondaryDisabled: "#635d81",
    },
    expert: {
        primary: "#84419e",
        primaryHover1: "#a966bb",
        primaryHover2: "#bd82d3",
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
        secondaryDisabled: "#8a4d80",
    },
    grandmaster: {
        primary: "#6f057e",
        primaryHover1: "#8f1b9b",
        primaryHover2: "#a238b4",
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
};

export function colorsForDifficultyIndex(difficultyIndex: number) {
    const listOfColors = [
        difficultyColors.beginner,
        difficultyColors.intermediate,
        difficultyColors.advanced,
        difficultyColors.expert,
        difficultyColors.grandmaster,
    ];
    const colors = listOfColors[difficultyIndex];

    if (!colors) {
        throw 'Difficulty index is outside the range of colors.';
    }
    return colors;
}
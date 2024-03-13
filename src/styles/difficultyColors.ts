//color contrasts are calculated using https://contrastchecker.online/
//calculator based on WCAG 2.1 level AA https://www.w3.org/WAI/standards-guidelines/wcag/

export const difficultyColors = {
    beginner: {
        primary: "#16367b", // Adjusted Color - Contrast Ratios: Intermediate (1.47), Advanced (1.59), Expert (2.20), Grandmaster (1.23)
        primaryHover1: "#84a4e9", // Adjusted Color - Contrast Ratio with Primary: 4.58 - TODO: make text color darker when using this color
        primaryHover2: "#84a4e9", // TODO: remove this. just use primaryHover1, but invert the text and background colors.
        secondary: "#5e79ca",
        secondaryHover: "#798fd3",
        secondaryDisabled: "#0f172e",
    },
    intermediate: {
        primary: "#0f5881", // Adjusted Color - Contrast Ratios: Beginner (1.47), Advanced (1.07), Expert (1.49), Grandmaster (1.19)
        primaryHover1: "#87d0f9", // Adjusted Color - Contrast Ratio with Primary: 4.54
        primaryHover2: "#87d0f9", // TODO: remove this. just use primaryHover1, but invert the text and background colors.
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
        secondaryDisabled: "#1f4869",
    },
    advanced: {
        primary: "#595667", // Adjusted Color - Contrast Ratios: Beginner (1.59), Intermediate (1.07), Expert (1.37), Grandmaster (1.29)
        primaryHover1: "#d1cedf", // Adjusted Color - Contrast Ratio with Primary: 4.60
        primaryHover2: "#d1cedf", // TODO: remove this. just use primaryHover1, but invert the text and background colors.
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
        secondaryDisabled: "#8a4d80",
    },
    expert: {
        primary: "#875aaa", // Adjusted Color - Contrast Ratios: Beginner (2.20), Intermediate (1.49), Advanced (1.37), Grandmaster (1.78)
        primaryHover1: "#f8f0ff", // Adjusted Color - Contrast Ratio with Primary: 4.64
        primaryHover2: "#f8f0ff", // TODO: remove this. just use primaryHover1, but invert the text and background colors.
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
    grandmaster: {
        primary: "#4c3795", // Adjusted Color - Contrast Ratios: Beginner (1.23), Intermediate (1.19), Advanced (1.29), Expert (1.78)
        primaryHover1: "#c1adff", // Adjusted Color - Contrast Ratio with Primary: 4.67
        primaryHover2: "#c1adff", // TODO: remove this. just use primaryHover1, but invert the text and background colors.
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
} as const; // defined `as const` for more useful intellisense;

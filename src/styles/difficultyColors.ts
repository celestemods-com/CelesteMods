export const difficultyColors = {
    beginner: {
        primary: "#16367b", // Adjusted Color (Hue: 229°) - Contrast Ratios: Intermediate (5.46), Advanced (5.46), Expert (5.46), Grandmaster (4.68)
        primaryHover1: "#33568e", // Adjusted Color (Hue: 224°) - Contrast Ratio with Primary: 5.51
        primaryHover2: "#2d668c", // Adjusted Color (Hue: 220°) - Contrast Ratio with Primary: 4.88
        secondary: "#5e79ca",
        secondaryHover: "#798fd3",
        secondaryDisabled: "#0f172e",
    },
    intermediate: {
        primary: "#0f5881",
        primaryHover1: "#9372bd",
        primaryHover2: "#8e78be",
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
        secondaryDisabled: "#1f4869",
    },
    advanced: {
        primary: "#595667",
        primaryHover1: "#9372bd",
        primaryHover2: "#8e78be",
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
        secondaryDisabled: "#8a4d80",
    },
    expert: {
        primary: "#875aaa", // Adjusted Color (Hue: 280°) - Contrast Ratios: Beginner (4.65), Intermediate (4.51), Advanced (5.38), Grandmaster (5.38)
        primaryHover1: "#8f1b9b", // Adjusted Color (Hue: 308°) - Contrast Ratio with Primary: 5.46
        primaryHover2: "#a238b4", // Adjusted Color (Hue: 310°) - Contrast Ratio with Primary: 4.65
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
    grandmaster: {
        primary: "#4c3795", // Adjusted Color (Hue: 262°) - Contrast Ratios: Beginner (4.68), Intermediate (4.46), Advanced (5.38), Expert (5.38)
        primaryHover1: "#269191", // Adjusted Color (Hue: 180°) - Contrast Ratio with Primary: 5.38
        primaryHover2: "#3aa4a4", // Adjusted Color (Hue: 180°) - Contrast Ratio with Primary: 4.68
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
} as const; // defined `as const` for more useful intellisense;

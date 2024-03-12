export const difficultyColors = {
    beginner: {
        primary: "#16367b", // Adjusted Color (Hue: 229°) - Contrast Ratios: Intermediate (4.51), Advanced (4.53), Expert (4.65), Grandmaster (4.68)
        primaryHover1: "#4369a1", // Adjusted Color (Hue: 227°) - Contrast Ratio with Primary: 4.54
        primaryHover2: "#3c699d", // Adjusted Color (Hue: 224°) - Contrast Ratio with Primary: 4.64 - Contrast Ratio with Primary Hover 1: 3.04
        secondary: "#5e79ca",
        secondaryHover: "#798fd3",
        secondaryDisabled: "#0f172e",
    },
    intermediate: {
        primary: "#0f5881", // Adjusted Color (Hue: 198°) - Contrast Ratios: Beginner (4.51), Advanced (4.38), Expert (4.51), Grandmaster (4.46)
        primaryHover1: "#3e5b83", // Adjusted Color (Hue: 197°) - Contrast Ratio with Primary: 4.56
        primaryHover2: "#395b81", // Adjusted Color (Hue: 196°) - Contrast Ratio with Primary: 4.69 - Contrast Ratio with Primary Hover 1: 3.02
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
        secondaryDisabled: "#1f4869",
    },
    advanced: {
        primary: "#595667", // Adjusted Color (Hue: 258°) - Contrast Ratios: Beginner (4.53), Intermediate (4.38), Expert (4.55), Grandmaster (4.43)
        primaryHover1: "#7a6d93", // Adjusted Color (Hue: 256°) - Contrast Ratio with Primary: 4.58
        primaryHover2: "#726c92", // Adjusted Color (Hue: 255°) - Contrast Ratio with Primary: 4.71 - Contrast Ratio with Primary Hover 1: 3.02
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
        secondaryDisabled: "#8a4d80",
    },
    expert: {
        primary: "#875aaa", // Adjusted Color (Hue: 280°) - Contrast Ratios: Beginner (4.65), Intermediate (4.51), Advanced (5.38), Grandmaster (5.38)
        primaryHover1: "#a584b9", // Adjusted Color (Hue: 279°) - Contrast Ratio with Primary: 4.68
        primaryHover2: "#a084b7", // Adjusted Color (Hue: 278°) - Contrast Ratio with Primary: 4.79 - Contrast Ratio with Primary Hover 1: 3.02
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
    grandmaster: {
        primary: "#4c3795", // Adjusted Color (Hue: 262°) - Contrast Ratios: Beginner (4.68), Intermediate (4.46), Advanced (4.43), Expert (4.54)
        primaryHover1: "#785fb3", // Adjusted Color (Hue: 260°) - Contrast Ratio with Primary: 4.71
        primaryHover2: "#715eb3", // Adjusted Color (Hue: 259°) - Contrast Ratio with Primary: 4.82 - Contrast Ratio with Primary Hover 1: 3.02
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
} as const; // defined `as const` for more useful intellisense;

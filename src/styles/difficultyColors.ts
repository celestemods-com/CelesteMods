//color contrasts are calculated using https://contrastchecker.online/
//calculator based on WCAG 2.1 level AA https://www.w3.org/WAI/standards-guidelines/wcag/

export const difficultyColors = {
    beginner: {
        primary: "#16367b", // Adjusted Color - Contrast Ratios: Intermediate (1.47), Advanced (1.59), Expert (2.20), Grandmaster (1.23)
        primaryHover1: "#6581ca", // Adjusted Color - Contrast Ratio with Primary: 3.00
        primaryHover2: "#dceafe", // Adjusted Color - Contrast Ratio with Primary: 8.30 - Contrast Ratio with Primary Hover 1: 3.10 - TODO: change text/icon color to something darker (maybe just x.primary) when using this color
        secondary: "#5e79ca",
        secondaryHover: "#798fd3",
        secondaryDisabled: "#0f172e",
    },
    intermediate: {
        primary: "#0f5881", // Adjusted Color - Contrast Ratios: Beginner (1.47), Advanced (1.07), Expert (1.49), Grandmaster (1.19)
        primaryHover1: "#3e5b83", // Adjusted Color - Contrast Ratio with Primary: 
        primaryHover2: "#395b81", // Adjusted Color - Contrast Ratio with Primary:  - Contrast Ratio with Primary Hover 1: 
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
        secondaryDisabled: "#1f4869",
    },
    advanced: {
        primary: "#595667", // Adjusted Color - Contrast Ratios: Beginner (1.59), Intermediate (1.07), Expert (1.37), Grandmaster (1.29)
        primaryHover1: "#7a6d93", // Adjusted Color - Contrast Ratio with Primary: 
        primaryHover2: "#726c92", // Adjusted Color - Contrast Ratio with Primary:  - Contrast Ratio with Primary Hover 1: 
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
        secondaryDisabled: "#8a4d80",
    },
    expert: {
        primary: "#875aaa", // Adjusted Color - Contrast Ratios: Beginner (2.20), Intermediate (1.49), Advanced (1.37), Grandmaster (1.78)
        primaryHover1: "#a584b9", // Adjusted Color - Contrast Ratio with Primary: 
        primaryHover2: "#a084b7", // Adjusted Color - Contrast Ratio with Primary:  - Contrast Ratio with Primary Hover 1: 
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
    grandmaster: {
        primary: "#4c3795", // Adjusted Color - Contrast Ratios: Beginner (1.23), Intermediate (1.19), Advanced (1.29), Expert (1.78)
        primaryHover1: "#785fb3", // Adjusted Color - Contrast Ratio with Primary: 
        primaryHover2: "#715eb3", // Adjusted Color - Contrast Ratio with Primary:  - Contrast Ratio with Primary Hover 1: 
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
        secondaryDisabled: "#833d70",
    },
} as const; // defined `as const` for more useful intellisense;

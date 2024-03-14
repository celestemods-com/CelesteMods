/** Easiest to hardest.
 * Must be in the same order as the `listOfColors` array in `./modsColors.ts`.
 */
export const canonicalDifficultyNames = ["beginner", "intermediate", "advanced", "expert", "grandmaster", "astral", "celestial"] as const;




type DifficultyColors = {
    primary: string;
    primaryHover: string;
    primaryDisabled: string;
    secondary: string;
    secondaryHover: string;
};

type DifficultyColorsObject = {
    [difficulty in typeof canonicalDifficultyNames[number]]: DifficultyColors;
};


export type DifficultyColorsObjects = typeof difficultyColors[keyof typeof difficultyColors];

//color contrasts are calculated using https://contrastchecker.online/
//contrast checker based on WCAG 2.1 level AA https://www.w3.org/WAI/standards-guidelines/wcag/

/** Colors must also be updated in ./globals.css */
export const difficultyColors = {
    beginner: {
        primary: "#16367b", // Adjusted Color - Contrast Ratios: Intermediate (1.47), Advanced (1.59), Expert (2.20), Grandmaster (1.23), Astral (), Celestial ()
        primaryHover: "#84a4e9", // Adjusted Color - Contrast Ratio with Primary: 4.58 - TODO: make text color darker when using this color
        primaryDisabled: "#0f172e",
        secondary: "#4f942f",
        secondaryHover: "#798fd3",
    },
    intermediate: {
        primary: "#0f5881", // Adjusted Color - Contrast Ratios: Beginner (1.47), Advanced (1.07), Expert (1.49), Grandmaster (1.19), Astral (), Celestial ()
        primaryHover: "#87d0f9", // Adjusted Color - Contrast Ratio with Primary: 4.54
        primaryDisabled: "#1f4869",
        secondary: "#3891d1",
        secondaryHover: "#66aadf",
    },
    advanced: {
        primary: "#595667", // Adjusted Color - Contrast Ratios: Beginner (1.59), Intermediate (1.07), Expert (1.37), Grandmaster (1.29), Astral (), Celestial ()
        primaryHover: "#d1cedf", // Adjusted Color - Contrast Ratio with Primary: 4.60
        primaryDisabled: "#8a4d80",
        secondary: "#b66fc5",
        secondaryHover: "#d494df",
    },
    expert: {
        primary: "#875aaa", // Adjusted Color - Contrast Ratios: Beginner (2.20), Intermediate (1.49), Advanced (1.37), Grandmaster (1.78), Astral (), Celestial ()
        primaryHover: "#f8f0ff", // Adjusted Color - Contrast Ratio with Primary: 4.64
        primaryDisabled: "#833d70",
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
    },
    grandmaster: {
        primary: "#4c3795", // Adjusted Color - Contrast Ratios: Beginner (1.23), Intermediate (1.19), Advanced (1.29), Expert (1.78), Astral (), Celestial ()
        primaryHover: "#c1adff", // Adjusted Color - Contrast Ratio with Primary: 4.67
        primaryDisabled: "#833d70",
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
    },
    astral: {
        primary: "#4c3795", // Placeholder Color - Contrast Ratios: Beginner (1.23), Intermediate (1.19), Advanced (1.29), Expert (1.78), Grandmaster (), Celestial ()
        primaryHover: "#c1adff", // Placeholder Color - Contrast Ratio with Primary: 
        primaryDisabled: "#833d70",
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
    },
    celestial: {
        primary: "#4c3795", // Placeholder Color - Contrast Ratios: Beginner (1.23), Intermediate (1.19), Advanced (1.29), Expert (1.78), Grandmaster (), Astral ()
        primaryHover: "#c1adff", // Placeholder Color - Contrast Ratio with Primary: 
        primaryDisabled: "#833d70",
        secondary: "#a336ad",
        secondaryHover: "#c362cd",
    },
} as const satisfies DifficultyColorsObject; // defined `as const` for more useful intellisense - `satisfies` ensures that the object conforms to the type but avoids type narrowing (which makes intellisense less useful)
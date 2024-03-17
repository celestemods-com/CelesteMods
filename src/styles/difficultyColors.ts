/** Easiest to hardest.
 * Must be in the same order as the `listOfColors` array in `./modsColors.ts`.
 * Used to specify the canonical property/class names for each difficulty as well as their order.
 */
export const canonicalDifficultyNames = ["beginner", "intermediate", "advanced", "expert", "grandmaster", "astral", "celestial"] as const;




type ColorPair = {
    backgroundColor: string;
    textColor: "white" | "black";
};

type DifficultyColors = {
    primary: ColorPair;
    primaryHover: ColorPair;
    primaryDisabled: ColorPair;
    secondary: ColorPair;
    secondaryHover: ColorPair;
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
        primary: {
            backgroundColor: "#16367b", // Adjusted Color - Contrast Ratios: Intermediate 1.47, Advanced 1.59, Expert 2.20, Grandmaster 1.23, Astral , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#84a4e9", // Adjusted Color - Contrast Ratio with Primary: 4.58
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#5c72a3", // Adjusted Color - Contrast Ratio with Primary: 2.37 - WCAG guidelines don't require a minimum contrast ratio for disabled elements
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#4f942f",   // Adjusted Color - Contrast Ratios: Primary: 3.03, PrimaryHover: 1.50, PrimaryDisabled: 1.27
            textColor: "black",
        },
        secondaryHover: {
            backgroundColor: "#b8fd98",  // Adjusted Color - Contrast Ratios: Secondary: 3.12
            textColor: "black",
        },
    },
    intermediate: {
        primary: {
            backgroundColor: "#0f5881", // Adjusted Color - Contrast Ratios: Beginner 1.47, Advanced 1.07, Expert 1.49, Grandmaster 1.19, Astral , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#87d0f9", // Adjusted Color - Contrast Ratio with Primary: 4.54
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#5c89a3", // Adjusted Color - Contrast Ratio with Primary: 2.03 - WCAG guidelines don't require a minimum contrast ratio for disabled elements
            textColor: "black",
        },
        secondary: {
            backgroundColor: "#89ae4a", // Adjusted Color - Contrast Ratios: Primary: 3.00, PrimaryHover: , PrimaryDisabled: 
            textColor: "black",
        },
        secondaryHover: {
            backgroundColor: "#395c00", // Adjusted Color - Contrast Ratios: Secondary: 3.03
            textColor: "white",
        },
    },
    advanced: {
        primary: {
            backgroundColor: "#595667", // Adjusted Color - Contrast Ratios: Beginner 1.59, Intermediate 1.07, Expert 1.37, Grandmaster 1.29, Astral , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#d1cedf", // Adjusted Color - Contrast Ratio with Primary: 4.60
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#242131", // Adjusted Color - Contrast Ratio with Primary: 2.20 - WCAG guidelines don't require a minimum contrast ratio for disabled elements
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#9cad9f", // Adjusted Color - Contrast Ratios: Primary: 3.01, PrimaryHover: , PrimaryDisabled:
            textColor: "black",
        },
        secondaryHover: {
            backgroundColor: "#4b5c4e", // Adjusted Color - Contrast Ratios: Secondary: 3.02
            textColor: "white",
        },
    },
    expert: {
        primary: {
            backgroundColor: "#875aaa", // Adjusted Color - Contrast Ratios: Beginner 2.20, Intermediate 1.49, Advanced 1.37, Grandmaster 1.78, Astral , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#f8f0ff", // Adjusted Color - Contrast Ratio with Primary: 4.64
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#473753", // Adjusted Color - Contrast Ratio with Primary: 2.10 - WCAG guidelines don't require a minimum contrast ratio for disabled elements
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#e3c093", // Adjusted Color - Contrast Ratios: Primary: 3.00, PrimaryHover: , PrimaryDisabled:
            textColor: "black",
        },
        secondaryHover: {
            backgroundColor: "#896639", // Adjusted Color - Contrast Ratios: Secondary: 3.03
            textColor: "white",
        },
    },
    grandmaster: {
        primary: {
            backgroundColor: "#4c3795", // Adjusted Color - Contrast Ratios: Beginner 1.23, Intermediate 1.19, Advanced 1.29, Expert 1.78, Astral , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#c1adff", // Adjusted Color - Contrast Ratio with Primary: 4.67
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#161226", // Adjusted Color - Contrast Ratio with Primary: 1.99 - WCAG guidelines don't require a minimum contrast ratio for disabled elements
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#cc826e", // Adjusted Color - Contrast Ratios: Primary: 3.05, PrimaryHover: , PrimaryDisabled:
            textColor: "black",
        },
        secondaryHover: {
            backgroundColor: "#7c3214", // Adjusted Color - Contrast Ratios: Secondary: 3.00
            textColor: "white",
        },
    },
    astral: {
        primary: {
            backgroundColor: "#4c3795", // Placeholder Color - Contrast Ratios: Beginner 1.23, Intermediate 1.19, Advanced 1.29, Expert 1.78, Grandmaster , Celestial 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#c1adff", // Placeholder Color - Contrast Ratio with Primary: 
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#161226",
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#a336ad",
            textColor: "white",
        },
        secondaryHover: {
            backgroundColor: "#c362cd",
            textColor: "black",
        },
    },
    celestial: {
        primary: {
            backgroundColor: "#4c3795", // Placeholder Color - Contrast Ratios: Beginner 1.23, Intermediate 1.19, Advanced 1.29, Expert 1.78, Grandmaster , Astral 
            textColor: "white",
        },
        primaryHover: {
            backgroundColor: "#c1adff", // Placeholder Color - Contrast Ratio with Primary: 
            textColor: "black",
        },
        primaryDisabled: {
            backgroundColor: "#161226",
            textColor: "white",
        },
        secondary: {
            backgroundColor: "#a336ad",
            textColor: "white",
        },
        secondaryHover: {
            backgroundColor: "#c362cd",
            textColor: "black",
        },
    },
} as const satisfies DifficultyColorsObject; // defined `as const` for more useful intellisense - `satisfies` ensures that the object conforms to the type but avoids type narrowing (which makes intellisense less useful)
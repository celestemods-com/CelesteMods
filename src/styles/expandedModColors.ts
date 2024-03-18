import type { ColorPair } from "./types";




type ExpandedModColors_General = {
    default: ColorPair;
}




export const expandedModColors = {
    default: {
        backgroundColor: "#e1e1e2",
        textColor: "black",
    },
} as const satisfies ExpandedModColors_General;


export type ExpandedModColors = typeof expandedModColors;
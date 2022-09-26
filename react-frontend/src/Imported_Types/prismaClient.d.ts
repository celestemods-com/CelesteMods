export type mods_details_type = "Normal" | "Collab" | "Contest" | "Lobby";

export interface difficulties {
    id: number;
    name: string;
    description: string | null;
    parentModID: number | null;
    parentDifficultyID: number | null;
    order: number;
};
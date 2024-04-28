import { createContext } from "react";
import { StateObject } from "./globalContextsProvider";
import type { GamebananaModId } from "../mods/types";


export type ModImageUrls = Record<GamebananaModId, string[]>;


export const modImageUrlsContext = createContext<StateObject<ModImageUrls> | null>(null);
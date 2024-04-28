import { createContext } from "react";
import { StateObject } from "./globalContextsProvider";
import type { GamebananaModId } from "../mods/types";


export type ModDownloadUrls = Record<GamebananaModId, string>;


export const modDownloadUrlsContext = createContext<StateObject<ModDownloadUrls> | null>(null);
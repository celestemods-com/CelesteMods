import { constants } from "fs/promises";
import { validateDirectory } from "./validateDirectory";




export const validateCacheDirectory = (): Promise<void> => validateDirectory("cache", constants.W_OK);
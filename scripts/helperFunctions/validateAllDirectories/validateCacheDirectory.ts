import { constants } from "fs/promises";
import { validateDirectory } from "./validateDirectory";




export const validateCacheDirectory = async (): Promise<void> => {
    validateDirectory("cache", constants.W_OK);
};
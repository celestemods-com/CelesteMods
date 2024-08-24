import { constants } from "fs/promises";
import { validateDirectory } from "./validateDirectory";




export const validateLogDirectory = async (): Promise<void> => {
    validateDirectory("logs", constants.W_OK);
};
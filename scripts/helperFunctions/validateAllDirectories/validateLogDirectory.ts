import { constants } from "fs/promises";
import { validateDirectory } from "./validateDirectory";




export const validateLogDirectory = (): Promise<void> => validateDirectory("logs", constants.W_OK);
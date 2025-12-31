import { validateCacheDirectory } from "./validateCacheDirectory";
import { validateLogDirectory } from "./validateLogDirectory";




/** Validates all directories that must exist for the Next.js app to run properly. */
export const validateAllDirectories = async (): Promise<void> => {
    const promises: Promise<void>[] = [
        validateCacheDirectory(),
        validateLogDirectory(),
    ];


    await Promise.all(promises);
};
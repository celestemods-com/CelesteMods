import { getUpdatedModSearchDatabase } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase/modSearchDatabase";
import { validateAllDirectories } from "./helperFunctions/validateAllDirectories/validateAllDirectories";




const preBuild = async () => {
    await validateAllDirectories();

    
    await getUpdatedModSearchDatabase();    // This function must be called after validateAllDirectories() because it uses the cache directory. This function is called so that an existing but out of date mod search database is updated before the app is built.
    console.log("Updated the mod search database.");    // getUpdatedModSearchDatabase() uses the server logger, which doesn't log to the console when called from here because the NODE_ENV is not set.
};




preBuild()
    .catch(console.error);
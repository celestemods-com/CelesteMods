import { type ModSearchDatabase } from "./yamlHandlers/modSearchDatabase";
import { type EverestUpdateDatabase } from "./yamlHandlers/everestUpdateDatabase";
import { serverLogger as logger } from "~/logger/serverLogger";




/** Updates the GameBanana mirror.
 * Returns the HTTP status code of the update.
*/
export const updateGamebananaMirror = async (everestUpdateDatabase: EverestUpdateDatabase, modSearchDatabase: ModSearchDatabase): Promise<number> => {
    logger.trace("Updating the GameBanana mirror.");

    return 200;

    //TODO!!!: Implement this
    // continue here
};
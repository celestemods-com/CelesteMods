import type { NextApiRequest, NextApiResponse } from "next";
import { serverLogger as logger } from "~/logger/serverLogger";
import { sendSuccessSignal } from "~/server/gamebananaMirror/sendSuccessSignal";
import { authenticateUpdateWebhookRequest } from "~/server/gamebananaMirror/authentication/authenticateUpdateWebhookRequest";
import { type ModSearchDatabase, modSearchDatabaseFileSystemErrorString, getUpdatedModSearchDatabase } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase";
import { updateGamebananaMirror } from "~/server/gamebananaMirror/updateGamebananaMirror";
import { type EverestUpdateDatabase, everestUpdateDatabaseFileSystemErrorString, getUpdatedEverestUpdateDatabase } from "~/server/gamebananaMirror/yamlHandlers/everestUpdateDatabase";




/** Downloads the new Everest Update Database and Mod Search Database before sending a response.
 * Sends a 200 status code if the download was successful.
 * Sends a 500 status code if the download was unsuccessful.
 * Sends 40X or 500 status codes if the authentication fails.
*/
const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    logger.trace("GameBanana mirror update request received.");


    const authenticationStatusCode = await authenticateUpdateWebhookRequest(req);

    if (authenticationStatusCode !== 200) {
        res.status(authenticationStatusCode).end();

        return;
    }

    logger.info("Authentic GameBanana mirror update request received.");


    // Update the Everest Update Database
    let everestUpdateDatabase: EverestUpdateDatabase;

    try {
        everestUpdateDatabase = await getUpdatedEverestUpdateDatabase();
    } catch (error) {
        if (error !== everestUpdateDatabaseFileSystemErrorString) {
            logger.error(error);
        }


        const errorMessage = typeof error === "string" ? error : "An unknown error occurred while updating the Everest Update Database.";


        res.status(500).json(errorMessage);

        return;
    }

    logger.info("The Everest Update Database has been updated.");


    // Update the Mod Search Database
    let modSearchDatabase: ModSearchDatabase;

    try {
        modSearchDatabase = await getUpdatedModSearchDatabase();
    } catch (error) {
        if (error !== modSearchDatabaseFileSystemErrorString) {
            logger.error(error);
        }


        const errorMessage = typeof error === "string" ? error : "An unknown error occurred while updating the Mod Search Database.";


        res.status(500).json(errorMessage);

        return;
    }

    logger.info("The Mod Search Database has been updated.");


    res.status(202).end();


    // Update the GameBanana mirror
    const mirrorUpdateStatus = await updateGamebananaMirror(everestUpdateDatabase, modSearchDatabase);

    if (mirrorUpdateStatus !== 200) {
        logger.error(`Failed to update the GameBanana mirror. Status code: ${mirrorUpdateStatus}`);

        return;
    }

    logger.info("Successfully updated the GameBanana mirror.");


    // Send a success signal
    await sendSuccessSignal(mirrorUpdateStatus);
};

export default handler;
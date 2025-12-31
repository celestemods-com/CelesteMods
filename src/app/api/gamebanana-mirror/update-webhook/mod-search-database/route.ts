import { NextResponse, type NextRequest } from "next/server";
import { serverLogger as logger } from "~/logger/serverLogger";
import { getUpdatedModSearchDatabase } from "~/server/gamebananaMirror/yamlHandlers/modSearchDatabase/modSearchDatabase";




/** Handle actual update webhook requests */
export const GET = async (_req: NextRequest) => {
    if (process.env.NODE_ENV !== "development") return new NextResponse(
        "Not Found",
        {
            status: 404,
        }
    );


    logger.info("Updating the Mod Search Database.");

    try {
        await getUpdatedModSearchDatabase();
    } catch (error) {
        let errorMessage: string;

        if (typeof error === "string") {
            errorMessage = error;   // Error strings are logged in the getUpdatedYaml function
        } else {
            logger.error(`Failed to update the Mod Search Database. ${error}`);

            errorMessage = "An unknown error occurred while updating the Mod Search Database.";
        }


        return new NextResponse(
            errorMessage,
            {
                status: 500,
            }
        );
    }


    const message = "The Mod Search Database has been updated.";

    logger.info(message);

    return new NextResponse(
        message,
        {
            status: 200,
        }
    );
};
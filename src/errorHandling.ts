import { Request, Response, NextFunction } from "express";

declare global {
    interface Error {
        status?: number;
    }
}

const noRouteError = function (_req: Request, res: Response, next: NextFunction) {
    try {
        res.status(404).json("Route not found");
    }
    catch (error) {
        next(error);
    }
}

const errorHandler = function (error: Error, _req: Request, res: Response, _next: NextFunction) {
    try {
        if (error.message) {
            console.log(error.message);
        }
        else {
            console.log(error);
        }

        
        res.status(error.status || 500).send({
            message: "Something went wrong"
        });
    }
    catch (error) {
        console.log("errorHandler tried to send the response after it had already been sent");
    }
}




interface errorWithMessage {
    message: string;
}

const isErrorWithMessage = function (error: unknown): error is errorWithMessage {
    return (
        typeof (error) === "object" &&
        error !== null &&
        "message" in error &&
        typeof ((error as Record<string, unknown>).message) === "string"
    )
}

const toErrorWithMessage = function (maybeError: unknown): errorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError;

    try {
        return new Error(JSON.stringify(maybeError));
    }
    catch {
        return new Error(String(maybeError));
    }
}




const methodNotAllowed = function (_req: Request, res: Response, next: NextFunction) {
    try {
        res.sendStatus(405);
    }
    catch (error) {
        next(error);
    }
}

export { errorWithMessage, isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed };
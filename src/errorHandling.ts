import { Request, Response, NextFunction } from "express";

declare global {
    interface Error {
        status?: number;
    }
}

const noRouteError = function (_req: Request, _res: Response, next: NextFunction) {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
}

const errorHandler = function (error: Error, _req: Request, res: Response, _next: NextFunction) {
    console.log(error.message);
    res.status(error.status || 500).send({
        message: "Something went wrong"
    });
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

export { errorWithMessage, isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler };
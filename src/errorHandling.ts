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

export { errorWithMessage, isErrorWithMessage, toErrorWithMessage };
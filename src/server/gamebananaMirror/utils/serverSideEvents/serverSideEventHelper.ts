import { setTimeout } from "timers/promises";
import { NextResponse } from "next/server";
import { serverLogger as logger } from "~/logger/serverLogger";




const TASK_COMPLETE_DEFAULT_MESSAGE = "Task completed successfully";
const TASK_ERROR_DEFAULT_MESSAGE = "Task failed";
const DEFAULT_ERROR_CODE = 500;


const DEFAULT_HEARTBEAT_SECONDS = 15;
const MAX_HEARTBEAT_SECONDS = 45;
const MIN_HEARTBEAT_SECONDS = 5;


/**
 * Validates the heartbeat seconds value and converts it to milliseconds.
 * Throws an error if the value is outside of the allowed range.
 */
const getValidatedHeartbeatMilliseconds = (value: number): number => {
    if (value < MIN_HEARTBEAT_SECONDS || value > MAX_HEARTBEAT_SECONDS) {
        throw `Invalid heartbeat seconds: '${value}'.\nHeartbeat seconds must be between ${MIN_HEARTBEAT_SECONDS} and ${MAX_HEARTBEAT_SECONDS}`;
    }

    return value * 1000;
};




/** `status` and `message` are always required. If `status` is "complete" or "error", `code` is also required. */
export type EventPayload = {
    message: string;
} & (
        { status: "started"; } |
        { status: "processing"; } |
        { status: "complete"; code: 200; } |
        { status: "error"; code: number; }
    );

export type EventStatus = EventPayload["status"];


type SendEvent = (payload: EventPayload) => void;

export type RequestHandlerResult = Extract<EventPayload, { status: "complete" | "error"; }>;

/** Represents a handler function for processing a request and returning an HTTP status code. */
export type RequestHandler = (args?: { sendEvent: SendEvent; }) => Promise<RequestHandlerResult>;




/**
 * Helper function for handling server-sent events (SSE) with regular heartbeats to keep the connection alive.
 * @param requestHandler The handler function that processes the request and sends mid-flight events.
 * @param heartbeatSeconds The interval in seconds for sending heartbeat messages.
 * @returns A NextResponse object representing the SSE response stream.
 */
export const serverSideEventHelper = async (
    requestHandler: RequestHandler,
    heartbeatSeconds = DEFAULT_HEARTBEAT_SECONDS,
): Promise<NextResponse> => {
    const encoder = new TextEncoder();


    let heartbeatMilliseconds;

    try {
        heartbeatMilliseconds = getValidatedHeartbeatMilliseconds(heartbeatSeconds);

        logger.info(`Using heartbeat interval of ${heartbeatSeconds} seconds`);
    } catch (error) {
        const errorMessage = typeof error === "string" ? error : null;

        logger.error(errorMessage ?? `Unknown heartbeat seconds validation error. heartbeatSeconds: ${heartbeatSeconds}`);

        return new NextResponse(errorMessage, { status: 500 });
    }


    const stream = new ReadableStream({
        async start(controller) {
            let isClientConnected = true;


            /** 
             * Safe enqueue helper.
             * Prevents crashes if the client closes the tab early.
             */
            const safeEnqueue = (input: string) => {
                if (!isClientConnected) return;

                try {
                    controller.enqueue(encoder.encode(input));
                } catch {
                    logger.warn("Client disconnected early");
                    isClientConnected = false;
                }
            };


            /**
            * Send heartbeat at regular intervals to keep the connection alive.
            * Prevents reverse proxies from closing the connection due to inactivity.
            */
            const heartbeat = setInterval(() => {
                logger.trace("Sending heartbeat");
                safeEnqueue(": keep-alive\n\n");
            }, heartbeatMilliseconds);


            /** 
             * Safely sends an event to the client.
             */
            const sendEvent: SendEvent = (payload) => {
                logger.debug(`Sending event: ${JSON.stringify(payload)}`);
                safeEnqueue(`data: ${JSON.stringify(payload)}\n\n`);
            };


            // Call the request handler and handle its result
            try {
                const result = await requestHandler({ sendEvent });

                if (result.status === "complete") {
                    logger.debug(TASK_COMPLETE_DEFAULT_MESSAGE);

                    sendEvent({
                        ...result,
                        message: result.message || TASK_COMPLETE_DEFAULT_MESSAGE,
                    });
                } else {    // status === "error"
                    logger.error(`Task error: ${JSON.stringify(result)}`);


                    let code = result.code;

                    if (code < 400 || code > 599) code = DEFAULT_ERROR_CODE;


                    sendEvent({
                        status: result.status,
                        code,
                        message: result.message || TASK_ERROR_DEFAULT_MESSAGE,
                    });
                }
            } catch (error) {
                logger.error("Task error:", error); // TODO: Verify that passing `error` here works as expected.


                let errorMessage: string;

                if (typeof error === "string") {
                    errorMessage = error;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                } else {
                    errorMessage = TASK_ERROR_DEFAULT_MESSAGE;
                }


                sendEvent({
                    status: "error",
                    code: DEFAULT_ERROR_CODE,
                    message: errorMessage,
                });
            } finally {
                clearInterval(heartbeat);


                try {
                    if (isClientConnected) controller.close();
                } catch { } // Ignore errors when closing the controller
            }
        },
    });


    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            // Tells reverse proxies not to buffer this specific response
            "X-Accel-Buffering": "no",
        },
    });
};
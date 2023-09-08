import pino, { type TransportTargetOptions } from "pino";
import pinoCaller from "pino-caller";




const isDevelopment = process.env.NODE_ENV === "development";




const developmentOnlyTargets: TransportTargetOptions[] = [
    {
        target: "pino-pretty",
        level: "info",
        options: {},
    },
];


const commonTargets: TransportTargetOptions[] = [
    {
        target: "pino/file",
        level: "trace",
        options: { destination: "./logs/log.txt" },
    },
    {
        target: "pino/file",
        level: "warn",
        options: { destination: "./logs/warnOnly.txt" },
    },
];




const targets = isDevelopment ? [...developmentOnlyTargets, ...commonTargets] : commonTargets;


const transport = pino.transport({ targets });




export const logger = isDevelopment ? pinoCaller(pino(transport), { relativeTo: "webpack-internal:///" }) : pino(transport);     //TODO!!!: decide how to prettify stack trace better. probably stop using pinoCaller and make my own wrapper

export { logger as default };
import pino, { type TransportTargetOptions } from "pino";




const developmentOnlyTargets: TransportTargetOptions[] = [
    {
        target: "pino-pretty",
        level: "info",
        options: {},
    },
];


const productionOnlyTargets: TransportTargetOptions[] = [
    {
        target: "pino/file",
        level: "warn",
        options: { destination: 1 },
    },
];


const commonTargets: TransportTargetOptions[] = [
    {
        target: "pino/file",
        level: "warn",
        options: {
            destination: "./logs/errors_and_warnings.txt",
            mkdir: true,
        },
    },
    {
        target: "pino/file",
        level: "info",
        options: {
            destination: "./logs/info.txt",
            mkdir: true,
        },
    },
];




const targets = process.env.NODE_ENV === "development" ? [...developmentOnlyTargets, ...commonTargets] : (
    process.env.NODE_ENV === "production" ?
        [...productionOnlyTargets, ...commonTargets] :
        commonTargets
);


const transport = pino.transport({ targets });




export const logger = pino(
    {
        base: undefined,
        nestedKey: "payload",
    },
    transport
);
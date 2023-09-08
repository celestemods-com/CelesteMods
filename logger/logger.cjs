const pino = require("pino");
const pinoCaller = require("pino-caller");




const isDevelopment = process.env.NODE_ENV === "development";




/** @type pino.TransportTargetOptions[] */
const developmentOnlyTargets = [
    {
        target: "pino-pretty",
        level: "info",
        options: {},
    },
];


/** @type pino.TransportTargetOptions[] */
const commonTargets = [
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



// @ts-ignore
const logger = isDevelopment ? pinoCaller(pino(transport), { relativeTo: "webpack-internal:///" }) : pino(transport);     //TODO!!!: decide how to prettify stack trace better. probably stop using pinoCaller and make my own wrapper

module.exports = { logger }
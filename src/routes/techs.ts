import express from "express";
import ajvModule from "ajv";
import { prisma } from "../prismaClient";
import { errorWithMessage, isErrorWithMessage, toErrorWithMessage } from "../errorHandling";
import { expressRouteTypes } from "../types/express";
import { tech_list } from ".prisma/client";


const router = express.Router();
const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        description: {
            type: "string",
            minLength: 0,
            maxLength: 150,
        },
        defaultDifficulty: { type: "string" },
    },
    additionalProperties: false,
    required: [ "name", "defaultDifficulty" ],
};
const patchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        description: {
            type: "string",
            minLength: 0,
            maxLength: 150,
        },
        defaultDifficulty: { type: "string" },
    },
    additionalProperties: false,
};


const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);


router.route("")

export {router as techsRouter};
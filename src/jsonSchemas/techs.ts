import ajvModule from "ajv";
import {intMaxSizes} from "./integerSizes";

const ajv = new ajvModule({ allowUnionTypes: true });


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
        videos: {
            type: "array",
            uniqueItems: true,
            minItems: 0,
            items: {
                anyOf: [{
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                }],
            },
        },
        difficulty: {
            type: ["string", "integer"],
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
    },
    additionalProperties: false,
    required: ["name", "difficulty"],
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
            type: ["string", "null"],
            minLength: 0,
            maxLength: 150,
        },
        videos: {
            type: "array",
            uniqueItems: true,
            minItems: 0,
            items: {
                anyOf: [{
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                }],
            },
        },
        difficulty: {
            type: ["string", "integer"],
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
    },
    additionalProperties: false,
};


const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);


export { validatePost, validatePatch };
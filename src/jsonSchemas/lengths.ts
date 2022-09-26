import ajvModule from "ajv";
import { intMaxSizes } from "../constants/integerSizes";

const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        order: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
    },
    additionalProperties: false,
    required: ["name", "description", "order"],
};


const patchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        order: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
    },
    additionalProperties: false,
};


const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);


export { validatePost, validatePatch };
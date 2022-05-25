import ajvModule from "ajv";
import { intMaxSizes } from "./integerSizes";

const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        mapID: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        quality: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
        difficultyID: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.smallInt.unsigned,
        },
    },
    anyOf: [
        {
            properties: {
                quality: {
                    type: "integer",
                    minimum: 1,
                    maximum: intMaxSizes.tinyInt.unsigned,
                },
            },
            required: ["quality"],
        },
        {
            properties: {
                difficultyID: {
                    type: "integer",
                    minimum: 1,
                    maximum: intMaxSizes.smallInt.unsigned,
                },
            },
            required: ["difficultyID"],
        },
    ],
    additionalProperties: false,
    required: ["mapID"],
};


const validatePost = ajv.compile(postSchema);


export { validatePost };
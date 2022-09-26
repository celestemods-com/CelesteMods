import ajvModule from "ajv";
import { intMaxSizes } from "../constants/integerSizes";

const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        discordCode: { type: "string" },
        displayName: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: "boolean" },
        showCompletedMaps: { type: "boolean" },
        completedMapIDs: {
            type: "array",
            minItems: 1,
            maxItems: 100000,
            items: {
                anyOf: [{
                    type: "integer",
                    minimum: 0,
                    maximum: intMaxSizes.mediumInt.unsigned,
                }],
            },
        },
        gamebananaIDs: {
            type: "array",
            items: {
                anyOf: [{
                    type: "integer",
                    minimum: 0,
                    maximum: intMaxSizes.mediumInt.unsigned,
                }],
            },
        },
        goldenPlayerID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        generateSessionBool: { type: "boolean" },
    },
    additionalProperties: false,
    required: ["discordCode", "displayName", "displayDiscord", "showCompletedMaps"],   //for production
    //required: ["displayName", "displayDiscord"],      //for testing
};


const patch1Schema = {
    type: "object",
    properties: {
        displayName: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: ["boolean", "null"] },
        showCompletedMaps: { type: ["boolean", "null"] },
        goldenPlayerID: {
            type: ["integer", "null"],
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
    },
    additionalProperties: false,
};


const patch2Schema = {
    type: "object",
    properties: {
        discordCode: { type: "string" },
    }
};


const patch3Schema = {
    type: "object",
    properties: {
        permissions: {
            type: "array",
            minItems: 0,
            uniqueItems: true,
            items: {
                type: "string",
                pattern: "(^Super_Admin$)|(^Admin$)|(^Map_Moderator$)|(^Map_Reviewer$)|(^Golden_Verifier$)",
            }
        }
    }
}


const validatePost = ajv.compile(postSchema);
const validatePatch1 = ajv.compile(patch1Schema);
const validatePatch2 = ajv.compile(patch2Schema);
const validatePatch3 = ajv.compile(patch3Schema);


export { validatePost, validatePatch1, validatePatch2, validatePatch3 };
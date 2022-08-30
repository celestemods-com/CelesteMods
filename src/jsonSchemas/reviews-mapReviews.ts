import ajvModule from "ajv";
import { intMaxSizes } from "../constants/integerSizes";
import { maxMapsPerMod } from "./maps-mods-publishers";
import { maxQuality } from "./ratings";




const mapReviewPostSchema = {
    $id: "mapReviewPostSchema",
    type: "object",
    properties: {
        mapID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        length: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        likes: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        dislikes: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        otherComments: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        displayRating: { type: "boolean" },
        quality: {
            type: ["integer", "null"],
            minimum: 0,
            maximum: maxQuality,
        },
        difficultyID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
    },
    anyOf: [
        {
            properties: {
                likes: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                },
            },
            required: ["likes"],
        },
        {
            properties: {
                dislikes: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                },
            },
            required: ["dislikes"],
        },
        {
            properties: {
                otherComments: {
                    type: "string",
                    minLength: 1,
                    maxLength: 500,
                },
            },
            required: ["otherComments"],
        },
    ],
    required: ["mapID", "length", "displayRating"],
    additionalProperties: false,
};


const mapReviewPatchSchema = {
    $id: "mapReviewPatchSchema",
    type: "object",
    properties: {
        lengthName: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 20,
        },
        likes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 500,
        },
        dislikes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 500,
        },
        otherComments: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 500,
        },
        displayRatingBool: { type: "boolean" },
    },
    additionalProperties: false,
};




const reviewPostSchema = {
    type: "object",
    properties: {
        modID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        likes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1000,
        },
        dislikes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1000,
        },
        otherComments: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1500,
        },
        mapReviews: {
            type: ["array", "null"],
            uniqueItems: true,
            minItems: 1,
            items: { $ref: "mapReviewPostSchema" },
        },
    },
    anyOf: [
        {
            properties: {
                likes: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
            },
            required: ["likes"],
        },
        {
            properties: {
                dislikes: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                },
            },
            required: ["dislikes"],
        },
        {
            properties: {
                otherComments: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1500,
                },
            },
            required: ["otherComments"],
        },
        {
            properties: {
                mapReviews: {
                    type: "array",
                    uniqueItems: true,
                    minItems: 1,
                    maxItems: maxMapsPerMod,
                    items: { $ref: "mapReviewPostSchema" },
                },
            },
            required: ["mapReviews"],
        },
    ],
    required: ["modID"],
    additionalProperties: false,
};


const reviewPatchSchema = {
    type: "object",
    properties: {
        likes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1000,
        },
        dislikes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1000,
        },
        otherComments: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 1500,
        },
    },
    additionalProperties: false,
};




const ajv = new ajvModule({
    allowUnionTypes: true,
    schemas: { mapReviewPostSchema },
    // logger: {
    //     log: console.log.bind(console),
    //     warn: function warn() {
    //         console.warn.apply(console);
    //     },
    //     error: function error() {
    //         console.error.apply(console);
    //     },
    // }
});




export const validateMapReviewPost = ajv.compile(mapReviewPostSchema);
export const validateMapReviewPatch = ajv.compile(mapReviewPatchSchema);
export const validateReviewPost = ajv.compile(reviewPostSchema);
export const validateReviewPatch = ajv.compile(reviewPatchSchema);
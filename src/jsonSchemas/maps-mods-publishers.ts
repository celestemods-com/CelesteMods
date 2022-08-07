import ajvModule from "ajv";
import { intMaxSizes } from "./integerSizes";



export const maxMapsPerMod = 100;
export const maxParentDifficultiesPerMod = 15;
export const maxChildDifficultiesPerParentDifficulty = 10;




const mapPostSchema = {
    $id: "mapPostSchema",
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
        },
        minimumModRevision: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
        canonicalDifficulty: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        length: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        notes: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        mapRemovedFromModBool: { type: "boolean" },
        techAny: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: 500,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        techFC: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: 500,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        mapperUserID: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        mapperNameString: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        chapter: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
        side: {
            type: "string",
            enum: ["A", "B", "C", "D", "E"],
        },
        modDifficulty: {
            type: ["string", "array"],
            minLength: 1,

            uniqueItems: false,
            minItems: 2,
            maxItems: 2,
            items: {
                type: "string",
                minLength: 1,
            },
        },
        overallRank: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
    },
    allOf: [
        {
            if: {
                properties: {
                    chapter: {
                        type: "integer",
                        minimum: 1,
                        maximum: intMaxSizes.tinyInt.unsigned,
                    },
                },
                required: ["chapter"],
            },
            then: {
                allOf: [
                    { not: { required: ["modDifficulty"] } },
                    { not: { required: ["overallRank"] } },
                ],
            },
        },
        {
            if: {
                properties: {
                    side: {
                        type: "string",
                        enum: ["A", "B", "C", "D", "E"],
                    },
                },
                required: ["side"],
            },
            then: {
                allOf: [
                    { not: { required: ["modDifficulty"] } },
                    { not: { required: ["overallRank"] } },
                ],
            },
        },
        {
            if: {
                properties: {
                    modDifficulty: {
                        type: ["string", "array"],
                        minLength: 1,

                        uniqueItems: false,
                        minItems: 2,
                        maxItems: 2,
                        items: {
                            type: "string",
                            minLength: 1,
                        },
                    },
                },
                required: ["modDifficulty"],
            },
            then: {
                allOf: [
                    { not: { required: ["chapter"] } },
                    { not: { required: ["side"] } },
                ]
            },
        },
        {
            if: {
                properties: {
                    overallRank: {
                        type: ["integer", "null"],
                        minimum: 1,
                        maximum: intMaxSizes.tinyInt.unsigned,
                    },
                },
                required: ["overallRank"],
            },
            then: {
                allOf: [
                    { not: { required: ["chapter"] } },
                    { not: { required: ["side"] } },
                ]
            },
        },
    ],
    required: ["name", "length"],
    additionalProperties: false,
};


const mapPatchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
        },
        canonicalDifficulty: {
            type: ["string", "null"],
            minLength: 0,
            maxLength: 50,
        },
        minimumModRevision: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
        assignedDifficulty: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        length: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 500,
        },
        notes: {
            type: ["string", "null"],
            minLength: 1,
            maxLength: 500,
        },
        techAny: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: 500,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        techFC: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: 500,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        mapRemovedFromModBool: {
            type: "boolean",
        },
        chapter: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
        side: {
            type: "string",
            enum: ["A", "B", "C", "D", "E"],
        },
        mapperUserID: {
            type: ["integer", "null"],
            minimum: 1,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        mapperNameString: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        modDifficulty: {
            type: ["string", "array"],
            minLength: 1,

            uniqueItems: false,
            minItems: 2,
            maxItems: 2,
            items: {
                type: "string",
                minLength: 1,
            },
        },
        overallRank: {
            type: ["integer", "null"],
            minimum: 1,
            maximum: intMaxSizes.tinyInt.unsigned,
        },
    },
    allOf: [
        {
            if: {
                properties: {
                    chapter: {
                        type: "integer",
                        minimum: 1,
                        maximum: intMaxSizes.tinyInt.unsigned,
                    },
                },
                required: ["chapter"],
            },
            then: {
                allOf: [
                    { not: { required: ["modDifficulty"] } },
                    { not: { required: ["overallRank"] } },
                ],
            },
        },
        {
            if: {
                properties: {
                    side: {
                        type: "string",
                        enum: ["A", "B", "C", "D", "E"],
                    },
                },
                required: ["side"],
            },
            then: {
                allOf: [
                    { not: { required: ["modDifficulty"] } },
                    { not: { required: ["overallRank"] } },
                ],
            },
        },
        {
            if: {
                properties: {
                    modDifficulty: {
                        type: ["string", "array"],
                        minLength: 1,

                        uniqueItems: false,
                        minItems: 2,
                        maxItems: 2,
                        items: {
                            type: "string",
                            minLength: 1,
                        },
                    },
                },
                required: ["modDifficulty"],
            },
            then: {
                allOf: [
                    { not: { required: ["chapter"] } },
                    { not: { required: ["side"] } },
                ]
            },
        },
        {
            if: {
                properties: {
                    overallRank: {
                        type: ["integer", "null"],
                        minimum: 1,
                        maximum: intMaxSizes.tinyInt.unsigned,
                    },
                },
                required: ["overallRank"],
            },
            then: {
                allOf: [
                    { not: { required: ["chapter"] } },
                    { not: { required: ["side"] } },
                ]
            },
        },
    ],
    additionalProperties: false,
};




const modPostSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            enum: ["Normal", "Collab", "Contest", "Lobby"],
        },
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
        },
        publisherName: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        publisherID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        publisherGamebananaID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        userID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        contentWarning: { type: "boolean" },
        notes: {
            type: "string",
            minLength: 0,
            maxLength: 500,
        },
        shortDescription: {
            type: "string",
            minLength: 1,
            maxLength: 150,
        },
        longDescription: {
            type: "string",
            minLength: 0,
            maxLength: 1500,
        },
        gamebananaModID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        difficultyNames: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: maxParentDifficultiesPerMod,
            items: {
                anyOf: [
                    {
                        type: "string",
                        minLength: 1,
                        maxLength: 50,
                    },
                    {
                        type: "array",
                        uniqueItems: true,
                        minItems: 1,
                        maxItems: maxChildDifficultiesPerParentDifficulty,
                        items: {
                            anyOf: [{
                                type: "string",
                                minLength: 1,
                                maxLength: 50,
                            }],
                        },
                    },
                ],
            },
        },
        maps: {
            type: "array",
            uniqueItems: true,
            minItems: 1,
            maxItems: maxMapsPerMod,
            items: { $ref: "mapPostSchema" },
        },
    },
    anyOf: [
        {
            properties: {
                publisherName: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
            },
            required: ["publisherName"],
        },
        {
            properties: {
                publisherID: {
                    type: "integer",
                    minimum: 0,
                    maximum: intMaxSizes.smallInt.unsigned,
                },
            },
            required: ["publisherID"],
        },
        {
            properties: {
                publisherGamebananaID: {
                    type: "integer",
                    minimum: 0,
                    maximum: intMaxSizes.mediumInt.unsigned,
                },
            },
            required: ["publisherGamebananaID"],
        },
        {
            properties: {
                userID: {
                    type: "integer",
                    minimum: 0,
                    maximum: intMaxSizes.smallInt.unsigned,
                },
            },
            required: ["userID"],
        },
    ],
    additionalProperties: false,
    required: ["type", "name", "contentWarning", "shortDescription", "gamebananaModID", "maps"],
};


const modPatchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
        },
        publisherName: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        publisherID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        publisherGamebananaID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        userID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.smallInt.unsigned,
        },
        contentWarning: { type: "boolean" },
        notes: {
            type: ["string", "null"],
            minLength: 0,
            maxLength: 500,
        },
        shortDescription: {
            type: "string",
            minLength: 1,
            maxLength: 150,
        },
        longDescription: {
            type: ["string", "null"],
            minLength: 0,
            maxLength: 1500,
        },
        gamebananaModID: {
            type: "integer",
            minimum: 0,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
    },
    additionalProperties: false,
};




const validatePublisherPostSchema = {
    type: "object",
    anyOf: [
        {
            properties: {
                gamebananaID: {
                    type: "integer",
                    minimum: 1,
                    maximum: intMaxSizes.mediumInt.unsigned,
                },
            },
            required: ["gamebananaID"],
        },
        {
            properties: {
                name: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
            },
            required: ["name"],
        },
        {
            properties: {
                userID: {
                    type: "integer",
                    minimum: 1,
                    maximum: intMaxSizes.smallInt.unsigned,
                },
            },
            required: ["userID"],
        },
    ],
};


const validatePublisherPatchSchema = {
    type: "object",
    properties: {
        gamebananaID: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.mediumInt.unsigned,
        },
        name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        userID: {
            type: "integer",
            minimum: 1,
            maximum: intMaxSizes.smallInt.unsigned,
        }
    },
    additionalProperties: false,
};




const ajv = new ajvModule({
    allowUnionTypes: true,
    schemas: { mapPostSchema },
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




export const validateMapPost = ajv.compile(mapPostSchema);
export const validateMapPatch = ajv.compile(mapPatchSchema);
export const validateModPost = ajv.compile(modPostSchema);
export const validateModPatch = ajv.compile(modPatchSchema);
export const validatePublisherPost = ajv.compile(validatePublisherPostSchema);
export const validatePublisherPatch = ajv.compile(validatePublisherPatchSchema);
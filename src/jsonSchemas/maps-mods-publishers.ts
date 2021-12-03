import ajvModule from "ajv";

const ajv = new ajvModule({ allowUnionTypes: true });




const mapPostSchema = {};


const mapPatchSchema = {};




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
        },
        publisherGamebananaID: {
            type: "integer",
            minimum: 0,
        },
        userID: {
            type: "integer",
            minimum: 0,
        },
        contentWarning: { type: "boolean" },
        notes: {
            type: "string",
            minLength: 0,
            maxLength: 500,
        },
        shortDescription: {
            type: "string",
            minLength: 0,
            maxLength: 500,
        },
        longDescription: {
            type: "string",
            minLength: 0,
            maxLength: 1500,
        },
        gamebananaModID: {
            type: "integer",
            minimum: 0,
        },
        difficulties: {
            type: "array",
            uniqueItems: true,
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
            items: { anyOf: [mapPostSchema] },
        },
    },
    additionalProperties: false,
    required: ["type", "name", "contentWarning", "shortDescription", "gamebananaModID"],
};


const modPatchSchema = {
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
        publisherID: {
            type: "integer",
            minimum: 0,
        },
        publisherGamebananaID: {
            type: "integer",
            minimum: 0,
        },
        userID: {
            type: "integer",
            minimum: 0,
        },
        contentWarning: { type: "boolean" },
        notes: {
            type: "string",
            minLength: 0,
            maxLength: 500,
        },
        shortDescription: {
            type: "string",
            minLength: 0,
            maxLength: 500,
        },
        longDescription: {
            type: "string",
            minLength: 0,
            maxLength: 1500,
        },
        gamebananaModID: {
            type: "integer",
            minimum: 0,
        },
        difficulties: {
            type: "array",
            uniqueItems: true,
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
    },
    additionalProperties: false,
};




const publisherPatchSchema = {
    type: "object",
    properties: {

    },
    additionalProperties: false,
    required: ["type", "name", "contentWarning", "shortDescription", "maps"],
};




const validateMapPost = ajv.compile(mapPostSchema);
const validateMapPatch = ajv.compile(mapPatchSchema);
const validateModPost = ajv.compile(modPostSchema);
const validateModPatch = ajv.compile(modPatchSchema);
const validatePublisherPatch = ajv.compile(publisherPatchSchema);




export { validateMapPost, validateMapPatch, validateModPost, validateModPatch, validatePublisherPatch };
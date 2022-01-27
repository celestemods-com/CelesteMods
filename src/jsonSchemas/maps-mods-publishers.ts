import ajvModule from "ajv";




const mapPostSchema = {
    $id: "mapPostSchema",
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
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
        minimumModVersion: {
            type: "string",
            minLength: 1,
            maxLength: 15,
        },
        mapRemovedFromModBool: { type: "boolean" },
        techAny: {
            type: "array",
            uniqueItems: true,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        techFC: {
            type: "array",
            uniqueItems: true,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
    },
    allOf: [
        {
            anyOf: [
                {
                    properties: {
                        mapperUserID: {
                            type: "integer",
                            minimum: 1,
                        },
                    },
                    required: ["mapperUserID",]
                },
                {
                    properties: {
                        mapperNameString: {
                            type: "string",
                            minLength: 1,
                            maxLength: 50,
                        },
                    },
                    required: ["mapperNameString"],
                },
            ],
        },
        {
            oneOf: [
                {
                    properties: {
                        chapter: {
                            type: "integer",
                            minimum: 1,
                        },
                        side: {
                            type: "string",
                            enum: ["A", "B", "C", "D", "E"],
                        },
                    },
                    required: ["chapter", "side"],
                },
                {
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
                        overallRank: {
                            type: "integer",
                            minimum: 1,
                        },
                    },
                    required: ["modDifficulty"],
                },
            ],
        },
    ],
    additionalProperties: false,
    required: ["name", "minimumModVersion", "length", "mapRemovedFromModBool"],
};


const mapPatchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 200,
        },
        minimumModVersion: {
            type: "string",
            minLength: 1,
            maxLength: 15,
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
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        notes: {
            type: "string",
            minLength: 1,
            maxLength: 500,
        },
        techAny: {
            type: "array",
            uniqueItems: true,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        techFC: {
            type: "array",
            uniqueItems: true,
            items: {
                type: "string",
                minLength: 1,
                maxLength: 50,
            },
        },
        mapperUserID: {
            type: "integer",
            minimum: 1,
        },
        mapperNameString: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
    },
    oneOf: [
        {
            properties: {
                chapter: {
                    type: "integer",
                    minimum: 1,
                },
                side: {
                    type: "string",
                    enum: ["A", "B", "C", "D", "E"],
                },
            },
        },
        {
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
                overallRank: {
                    type: "integer",
                    minimum: 1,
                },
            },
        },
    ],
    additionalProperties: false,
};


const mapPutSchema = {
    type: "object",
    properties: {
        maximumModVersion: {
            type: "string",
            minLength: 1,
            maxLength: 15,
        },
    },
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
        },
        difficultyNames: {
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
            items: { $ref: "mapPostSchema" },
        },
    },
    additionalProperties: false,
    required: ["type", "name", "contentWarning", "shortDescription", "gamebananaModID", "maps"],
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




const ajv = new ajvModule({ allowUnionTypes: true, schemas: {mapPostSchema} });




export const validateMapPost = ajv.compile(mapPostSchema);
export const validateMapPatch = ajv.compile(mapPatchSchema);
export const validateMapPut = ajv.compile(mapPutSchema);
export const validateModPost = ajv.compile(modPostSchema);
export const validateModPatch = ajv.compile(modPatchSchema);
export const validatePublisherPatch = ajv.compile(publisherPatchSchema);
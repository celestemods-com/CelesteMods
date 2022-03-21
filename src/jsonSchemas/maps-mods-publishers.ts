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
        minimumModRevision: {
            type: "integer",
            minimum: 0,
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
        chapter: {
            type: "integer",
            minimum: 1,
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
                        modDifficulty: false,
                        overallRank: false,
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
                        chapter: false,
                        side: false,
                    },
                    required: ["modDifficulty"],
                },
            ],
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
            type: "string",
            minLength: 0,
            maxLength: 50,
        },
        minimumModRevision: {
            type: "integer",
            minimum: 1,
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
        mapRemovedFromModBool: {
            type: "boolean",
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
        chapter: {
            type: "integer",
            minimum: 1,
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
        },
    },
    allOf: [
        {
            if: {
                properties: {
                    chapter: {
                        type: "integer",
                        minimum: 1,
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
                        type: "integer",
                        minimum: 1,
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
                        minItems: 1,
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
        },
        name: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        userID: {
            type: "integer",
            minimum: 1,
        }
    },
    additionalProperties: false,
};




const ajv = new ajvModule({
    allowUnionTypes: true,
    schemas: { mapPostSchema },
    logger: {
        log: console.log.bind(console),
        warn: function warn() {
            console.warn.apply(console);
        },
        error: function error() {
            console.error.apply(console);
        },
    }
});




export const validateMapPost = ajv.compile(mapPostSchema);
export const validateMapPatch = ajv.compile(mapPatchSchema);
export const validateModPost = ajv.compile(modPostSchema);
export const validateModPatch = ajv.compile(modPatchSchema);
export const validatePublisherPost = ajv.compile(validatePublisherPostSchema);
export const validatePublisherPatch = ajv.compile(validatePublisherPatchSchema);
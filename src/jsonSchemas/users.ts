import ajvModule from "ajv";

const ajv = new ajvModule();


const postSchema = {
    type: "object",
    properties: {
        discordToken: { type: "string" },
        discordTokenType: { type: "string" },
        displayName: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: "boolean" },
        gamebananaIDs: {
            type: "array",
            items: {
                anyOf: [{
                    type: "integer",
                    minimum: 0,
                }]
            },
        },
        goldenPlayerID: {
            type: "integer",
            minimum: 0,
        },
    },
    additionalProperties: false,
    required: ["discordToken", "discordTokenType", "displayName", "displayDiscord",],   //for production
    //required: ["displayName", "displayDiscord"],      //for testing
};


const patch1Schema = {
    type: "object",
    properties: {
        displayName: {
            type: "string",
            minLength: 1,
            maxLength: 50,
        },
        displayDiscord: { type: "boolean" },
        gamebananaIDs: {
            type: "array",
            items: {
                anyOf: [{
                    type: "integer",
                    minimum: 0,
                }]
            },
        },
        goldenPlayerID: {
            type: "integer",
            minimum: 0,
        },
    },
    additionalProperties: false,
};


const patch2Schema = {
    type: "object",
    properties: {
        discordToken: { type: "string" },
        discordTokenType: { type: "string" },
    }
};


const validatePost = ajv.compile(postSchema);
const validatePatch1 = ajv.compile(patch1Schema);
const validatePatch2 = ajv.compile(patch2Schema);


export { validatePost, validatePatch1, validatePatch2 };
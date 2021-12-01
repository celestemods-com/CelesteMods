import ajvModule from "ajv";

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
        difficulty: {
            type: ["string", "integer"],
            minimum: 0,
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
        difficulty: {
            type: ["string", "integer"],
            minimum: 0,
        },
    },
    additionalProperties: false,
};


const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);


export { validatePost, validatePatch };
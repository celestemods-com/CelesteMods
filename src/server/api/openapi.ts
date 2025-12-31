import { generateOpenApiDocument } from "trpc-openapi";

import { apiRouter } from "./root";




export const openApiDocument = generateOpenApiDocument(
    apiRouter,
    {
        title: "Celeste Mods List API",
        version: "1.0.0",
        baseUrl: "/api",
    },
);
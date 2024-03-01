import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "./root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'Celeste Mods List API',
    version: '1.0.0',
    baseUrl: '/api',
});
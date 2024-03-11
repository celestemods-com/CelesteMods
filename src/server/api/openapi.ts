import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "./root";




export const openApiDocument = generateOpenApiDocument(
    appRouter,
    {
        title: 'Celeste Mods List API',
        version: '1.0.0',
        baseUrl: `${process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ""}/api`,
    },
);
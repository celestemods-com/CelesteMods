import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { difficultyRouter } from "./routers/difficulty";
import { techRouter } from "./routers/techs/tech";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => 'yay!'),
  difficulty: difficultyRouter,
  tech: techRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { difficultyRouter } from "./routers/difficulty";
import { techRouter } from "./routers/techs/tech";
import { lengthRouter } from "./routers/length";
import { userRouter } from "./routers/user";
import { publisherRouter } from "./routers/map_mod_publisher/publisher";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => 'yay!'),
  difficulty: difficultyRouter,
  length: lengthRouter,
  tech: techRouter,
  user: userRouter,
  publisher: publisherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

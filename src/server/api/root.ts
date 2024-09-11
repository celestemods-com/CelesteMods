import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { difficultyRouter } from "./routers/difficulty";
import { techRouter } from "./routers/tech_techVideo/tech";
import { lengthRouter } from "./routers/length";
import { userRouter } from "./routers/user";
import { publisherRouter } from "./routers/map_mod_publisher/publisher";
import { modRouter } from "./routers/map_mod_publisher/mod";
import { mapRouter } from "./routers/map_mod_publisher/map";
import { qualityRouter } from "./routers/quality";
import { ratingRouter } from "./routers/rating";
import { reviewCollectionRouter } from "./routers/review_reviewCollection_mapReview/reviewCollection";
import { reviewRouter } from "./routers/review_reviewCollection_mapReview/review";
import { mapReviewRouter } from "./routers/review_reviewCollection_mapReview/mapReview";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const apiRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => 'yay!'),
  difficulty: difficultyRouter,
  length: lengthRouter,
  tech: techRouter,
  user: userRouter,
  publisher: publisherRouter,
  mod: modRouter,
  map: mapRouter,
  quality: qualityRouter,
  rating: ratingRouter,
  reviewCollection: reviewCollectionRouter,
  review: reviewRouter,
  mapReview: mapReviewRouter,
});

// export type definition of API
export type ApiRouter = typeof apiRouter;

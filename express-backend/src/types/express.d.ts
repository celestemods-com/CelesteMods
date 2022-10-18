import { Request, Response, NextFunction } from 'express';
import { difficulties, publishers } from '.prisma/client';
import { rawTech, rawMod, rawMap, rawReview, rawMapReview, rawReviewCollection } from './internal';


//TODO: refactor to use declare module instead of declare global namespace. see sessionMiddleware.d.ts


declare global {
  type reqDifficulty = {
    id?: number;
    name?: string;
    description?: string;
    parentModID?: number | null;
    parentDifficultyID?: number | null;
    order?: number | null;
  };
  type reqLength = {
    id?: number;
    name?: string;
    description?: string;
    order?: number;
  };
  type reqReview = {
    id?: number;
    likes?: string | null;
    dislikes?: string | null;
    otherComments?: string | null;
  };
  type reqMapReview = {
    id?: number;
    reviewID?: number;
    ratingID?: number;
    displayRatingBool?: boolean;
    lengthID?: number;
    likes?: string;
    dislikes?: string;
    otherComments?: string;
  };
  type reqRating = {
    id?: number;
    submittedBy?: number;
    mapID?: number;
    timeSubmitted?: number;
    quality?: number | null;
    techDefaultDifficultyID?: number | null;
    gameplayDefaultDifficultyID?: number | null;
  };
  type reqUser = {
    displayName?: string;
    displayDiscord?: boolean;
    gamebananaIDs?: number[];
  };

  namespace Express {
    interface Request {
      id?: number;
      id2?: number;
      id3?: number;
      revision?: number;
      name?: string;
      idsMatch?: boolean;
      valid?: boolean;
      difficulty?: difficulties;
      length?: reqLength;
      mod?: rawMod;
      mods?: rawMod[];
      map?: rawMap;
      publisher?: publishers;
      reviewCollection?: rawReviewCollection;
      review?: rawReview;
      mapReview?: rawMapReview;
      rating?: reqRating;
      tech?: rawTech;
    }

    interface Response {
      errorSent?: boolean;
    }
  }
}



export type expressRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;
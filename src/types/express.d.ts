import { Request, Response, NextFunction } from 'express';
import { difficulties, goldens_goldenList, publishers, review_collections } from '.prisma/client';
import { rawTech, rawMod, rawMap, rawReview, rawMapReview } from './internal';


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
  type reqGolden = {
    id?: number;
    mapID?: number;
    fullClearBool?: boolean;
    goldenList?: goldens_goldenList;
    otherList?: string | null;
    topGoldenListRank?: number | null;
  };
  type reqGoldenPlayer = {
    id?: number;
    name?: string;
    userID?: number;
  };
  type reqGoldenRun = {
    id?: number;
    goldenID?: number;
    goldenPlayerID?: number;
    proofURL?: string | null;
    timeCompleted?: number;
  };
  type reqGoldenSubmission = {
    id?: number;
    timeSubmitted?: number;
    submittedBy?: number;
    timeApproved?: number | null;
    approvedBy?: number | null;
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
    goldenPlayerID?: number;
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
      golden?: reqGolden;
      goldenPlayer?: reqGoldenPlayer;
      goldenRun?: reqGoldenRun;
      goldenSubmission?: reqGoldenSubmission;
      length?: reqLength;
      mod?: rawMod;
      mods?: rawMod[];
      map?: rawMap;
      publisher?: publishers;
      reviewCollection?: review_collections;
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
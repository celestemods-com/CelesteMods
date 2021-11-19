import { Request, Response, NextFunction } from 'express';
import { general_feedback_submissions_status, goldens_goldenList, maps_side, users_accountStatus, mods_type, ratings_quality } from '.prisma/client';


declare global {
  type reqDifficulty = { 
    id?: number;
    name?: string;
    description?: string | null;
    difficultyOrder?: number;
    parentDifficultyID?: number | null;
    defaultDifficultyBool?: boolean;
  };
  type reqGFSubmission = {
    id?: number;
    feedback?: string;
    status?: general_feedback_submissions_status;
    hiddenVotesBool?: boolean;
    timeSubmitted?: number;
    submittedBy?: number;
  };
  type reqGFVote = {
    generalFeedbackID?: number;
    userID?: number;
    inFavorBoolean?: boolean;
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
  type reqMod = {
    id?: number;
    type?: mods_type;
    name?: string;
    publisherID?: number;
    contentWarning?: boolean;
    notes?: string | null;
    shortDescription?: string | null;
    longDescription?: string | null;
    gamebananaModID?: number;
  };
  type reqMap = {
    id?: number;
    modID?: number;
    minimumModVersion?: string;
    maximumModVersion?: string | null;
    replacementMapID?: number | null;
    mapperUserID?: number | null;
    mapperNameString?: string | null;
    name?: string;
    assignedDifficultyID?: number;
    lengthID?: number;
    description?: string | null;
    notes?: string | null;
    chapter?: number | null;
    side?: maps_side | null;
    modDifficultyID?: number | null;
    overallRank?: number | null;
  };
  type reqPublisher = {
    id?: number;
    gamebananaID?: number | null;
    name?: string;
    userID?: number | null;
  };
  type reqMSubmission = {
    id?: number;
    timeSubmitted?: number;
    submittedBy?: number;
    timeApproved?: number | null;
    approvedBy?: number | null;
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
    quality?: ratings_quality | null;
    techDefaultDifficultyID?: number | null;
    gameplayDefaultDifficultyID?: number | null;
  };
  type reqTech = {
    id?: number;
    name?: string;
    description?: string | null;
    defaultDifficultyID?: number;
  };
  type reqUser = {
    id?: number;
    displayName?: string;
    discordID?: string;
    timeCreated?: number;
    permissions?: string;
    accountStatus?: users_accountStatus;
    timeDeletedOrBanned?: number | null;
  };


  namespace Express {
      interface Request {
        id: number;
        valid?: boolean;
        difficulty?: reqDifficulty;
        gfSubmission?: reqGFSubmission;
        gfVote?: reqGFVote;
        golden?: reqGolden;
        goldenPlayer?: reqGoldenPlayer;
        goldenRun?: reqGoldenRun;
        goldenSubmission?: reqGoldenSubmission;
        length?: reqLength;
        mod?: reqMod;
        map?: reqMap;
        publisher?: reqPublisher;
        mSubmission?: reqMSubmission;
        review?: reqReview;
        mapReviews?: reqMapReview[];
        rating?: reqRating;
        tech?: reqTech;
        user?: reqUser;
      }
  }
}



// interface routeParamTypes {
//     req?: Request,
//     res?: Response,
//     next?: NextFunction
// }

type expressRouteTypes = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {expressRouteTypes};
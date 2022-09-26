import { mods_details_type } from ".prisma/client";


export interface formattedSession {
  sid: string;
  sessionExpiryTime: Date;
  refreshCount: number;
  userID: number;
}


export interface formattedUser {
  id: number;
  displayName: string;
  discordUsername?: string;
  discordDescrim?: string;
  displayDiscord?: boolean;
  timeCreated?: number;
  permissions?: permissions[];
  accountStatus: string;
  timeDeletedOrBanned?: number;
  showCompletedMaps?: boolean;
  completedMapIDs?: number[];
  gamebananaIDs?: number[];
  goldenPlayerID?: number;
}

export type permissions = "Super_Admin" | "Admin" | "Map_Moderator" | "Map_Reviewer" | "Golden_Verifier";


export interface formattedTech {
  id: number;
  name: string;
  description?: string;
  videos?: string[];
  difficulty: number;
}


export interface formattedMod {
  id: number;
  revision: number;
  type: mods_details_type;
  name: string;
  publisherID: number;
  contentWarning: boolean;
  notes?: string;
  shortDescription: string;
  longDescription?: string;
  gamebananaModID?: number;
  maps: (formattedMap[] | string)[];
  difficulties?: (number | number[])[];
  approved: boolean;
}


interface formattedMap_base {
  id: number;
  revision: number;
  modID: number;
  minimumModRevision: number;
  name: string;
  canonicalDifficulty: number;
  lengthID: number;
  description?: string;
  notes?: string;
  mapRemovedFromModBool: boolean;
  techAny?: number[];
  techFC?: number[];
  approved: boolean;
}

export interface formattedMap_normal extends formattedMap_base {
  chapter?: number;
  side?: string;
}

export interface formattedMap_collabOrLobby extends formattedMap_base {
  mapperUserID?: number;
  mapperNameString: string;
  modDifficulty?: number | number[];
}

export interface formattedMap_contest extends formattedMap_collabOrLobby {
  overallRank?: number;
}

export type formattedMap = formattedMap_normal | formattedMap_collabOrLobby | formattedMap_contest;


export interface formattedPublisher {
  id: number;
  name: string;
  gamebananaID?: number;
  userID?: number;
}


export interface formattedRating {
  id: number;
  mapID: number;
  submittedBy: number;
  timeSubmitted: number;
  quality?: number;
  difficulty?: number[];
}

export interface ratingInfo {
  averageQuality?: number;
  averageDifficultyID?: number;
  averageDifficultyValue?: number;
  overallCount: number;
  qualityCount: number;
  difficultyCount: number;
}

export interface ratingsInfosTreeObjectType {
  [key: number]: ratingInfo;
}


export interface formattedReviewCollection {
  id: number;
  userID: number;
  name: string;
  description: string;
  reviews?: (formattedReview | string)[];
}

export interface formattedReview {
  id: number;
  modID: number;
  reviewCollectionID: number;
  timeSubmitted: number;
  likes?: string;
  dislikes?: string;
  otherComments?: string;
  mapReviews?: (formattedMapReview | string)[];
}

export interface formattedMapReview {
  id: number;
  reviewID: number;
  mapID: number;
  lengthID: number;
  likes?: string;
  dislikes?: string;
  otherComments?: string;
  displayRating: boolean;
  rating?: formattedRating;
}
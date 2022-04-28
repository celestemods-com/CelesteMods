import { difficulties } from ".prisma/client";

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
  gamebananaIDs?: number[];
  goldenPlayerID?: number;
}

export type permissions = "Super_Admin" | "Admin" | "Map_Moderator" | "Map_Reviewer" | "Golden_Verifier";

export interface formattedTech {
  id: number;
  name: string;
  description?: string;
  videos?: string[];
  difficulty: difficulties;
}

export interface formattedMod {
  id: number;
  revision: number;
  type: string;
  name: string;
  publisherID: number;
  publisherGamebananaID?: number;
  contentWarning: boolean;
  notes?: string;
  shortDescription: string;
  longDescription?: string;
  gamebananaModID?: number;
  maps: (formattedMap[] | string)[];
  difficulties?: (string | string[])[];
  approved: boolean;
}

export interface formattedMap {
  id: number;
  revision: number;
  modID: number;
  minimumModRevision: number;
  name: string;
  canonicalDifficulty: string;
  length: string;
  description?: string;
  notes?: string;
  mapperUserID?: number;
  mapperNameString: string;
  chapter?: number;
  side?: string;
  modDifficulty?: string | string[];
  overallRank?: number;
  mapRemovedFromModBool: boolean;
  techAny?: string[];
  techFC?: string[];
  approved: boolean;
}

export interface formattedPublisher {
  id: number;
  name: string;
  gamebananaID?: number;
  userID?: number;
}
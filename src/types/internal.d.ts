import { users, publishers, golden_players, tech_list, difficulties, mods, maps, map_and_mod_submissions } from ".prisma/client";


export interface createUserData {
  displayName: string;
  discordID: string;
  discordUsername: string;
  discordDiscrim: string;
  displayDiscord: boolean;
  timeCreated: number;
  permissions: string;
  publishers?: Object;
  golden_players?: Object;
}

export interface updateUserData {
  displayName?: string;
  displayDiscord?: boolean;
  publishers?: Object;
  golden_players?: Object;
}

export interface rawUser extends users {
  publishers: publishers[];
  golden_players: golden_players | null;
}




export interface createDifficultyData {
  name: string;
  description: string | null;
  parentModID: number | null;
  parentDifficultyID: number | null;
  order: number;
}




export interface createTechData {
  name: string;
  description?: string | null;
  difficulties: Object;
}

export interface updateTechData {
  name?: string;
  description?: string | null;
  difficulties?: Object;
}

export interface rawTech extends tech_list {
  difficulties: difficulties;
}




export interface rawMod extends mods {
  publishers: publishers;
  difficulties: difficulties[];
  maps: maps[];
  map_and_mod_submissions_map_and_mod_submissionsTomods_creationMSubmissionID: map_and_mod_submissions;
  map_and_mod_submissions_map_and_mod_submissionsTomods_replacementMSubmissionID: map_and_mod_submissions | null;
}




export interface rawMap extends maps {

}




export interface rawPublisher extends publishers {

}




export interface createMSubmissionData {
  timeSubmitted: number;
  users_map_and_mod_submissions_submittedByTousers: { connect: { id: number } },
  timeApproved?: number | null;
  users_map_and_mod_submissions_approvedByTousers?: { connect: { id: number } };
}
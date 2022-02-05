import { users, publishers, golden_players, tech_list, tech_videos, difficulties, mods_ids, mods_details, mods_details_type, maps_ids, maps_details, maps_details_side,
  map_lengths, maps_to_tech } from ".prisma/client";


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

export interface submitterUser extends users {
  permissionsArray: string[];
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
  techVideos?: { create: createTechVideosData[] };
  difficulties: Object;
}

export interface createTechVideosData {
  url: string;
}

export interface updateTechData {
  name?: string;
  description?: string | null;
  difficulties?: Object;
  techVideos?: { connectOrCreate: createTechVideosData[] };
}

export interface rawTech extends tech_list {
  techVideos?: tech_videos[];
  difficulties: difficulties;
}




export interface rawMod extends mods_ids {
  difficulties: difficulties[];
  mods_details: rawModDetails[];
  maps_ids: rawMap[];
}

interface rawModDetails extends mods_details {
  publishers: publishers;
}


export interface modDetailsCreationObject {
  revision: number;
  type: mods_details_type;
  name: string;
  publishers: publisherConnectionObject;
  contentWarning: boolean;
  notes?: string | null;
  shortDescription: string;
  longDescription?: string | null;
  gamebananaModID: number;
  timeSubmitted: number;
  users_mods_details_submittedByTousers: { connect: { id: number } };
  timeApproved?: number;
  users_mods_details_approvedByTousers?: { connect: { id: number } };
}

export interface loneModDetailsCreationObject extends modDetailsCreationObject {
  mods_ids: { connect: { id: number } }
}



export interface createChildDifficultyForMod {
  id: number;
  name: string;
  description?: string;
  order: number;
}

export interface createParentDifficultyForMod extends createChildDifficultyForMod {
  id: number;
  other_difficulties?: { create: createChildDifficultyForMod[] };
}

export interface defaultDifficultyForMod extends difficulties {
  other_difficulties?: difficulties[];
}

export interface jsonCreateMapWithMod {
  name: string;
  minimumModRevision: number;
  canonicalDifficulty?: string | null;
  length: string;
  description?: string;
  notes?: string;
  mapperUserID?: number;
  mapperNameString?: string;
  chapter?: number;
  side?: maps_details_side;
  modDifficulty?: string | string[];
  overallRank?: number;
  mapRemovedFromModBool: boolean;
  techAny?: string[];
  techFC?: string[];
}


export interface mapIdCreationObject {
  minimumModRevision: number;
  map_details: {
    create: mapDetailsCreationObject[]
  }
}

export interface mapDetailsCreationObject {
  name: string;
  canonicalDifficulty: number;
  map_lengths: { connect: { id: number } };
  description?: string;
  notes?: string;
  mapRemovedFromModBool: boolean;
  users_maps_details_mapperUserIDTousers?: { connect: { id: number } };
  mapperNameString?: string;
  timeSubmitted: number;
  users_maps_details_submittedByTousers: { connect: { id: number } };
  timeApproved?: number;
  users_maps_details_approvedByTousers?: { connect: { id: number } };
  chapter?: number;
  side?: maps_details_side;
  difficulties_difficultiesTomaps_details_modDifficultyID?: { connect: { id: number } };
  overallRank?: number;
  maps_to_tech_maps_detailsTomaps_to_tech_mapID?: {
    create: mapToTechCreationObject[]
  }
}

export interface mapToTechCreationObject {
  maps_details_maps_detailsTomaps_to_tech_revision: number,
  tech_list: { connect: { name: string } },
  fullClearOnlyBool?: boolean;
}




export interface rawMap extends maps_ids {
  mods_ids?: rawModForMap;
  maps_details: rawMapDetails[];
}

interface rawMapDetails extends maps_details {
  map_lengths: map_lengths;
  difficulties_difficultiesTomaps_details_canonicalDifficultyID: difficulties;
  difficulties_difficultiesTomaps_details_modDifficultyID: difficulties | null;
  users_maps_details_mapperUserIDTousers: users | null;
  maps_to_tech_maps_detailsTomaps_to_tech_mapID: rawMapsToTech[];
}

interface rawMapsToTech extends maps_to_tech {
  tech_list: tech_list;
}

interface rawModForMap extends mods_ids {
  mods_details: mods_details[];
}




export interface rawPublisher extends publishers {

}

export interface publisherConnectionObject {

}
import { users, publishers, golden_players, tech_list, difficulties } from ".prisma/client";


interface createUserData {
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

  interface updateUserData {
      displayName?: string;
      displayDiscord?: boolean;
      publishers?: Object;
      golden_players?: Object;
  }

  interface rawUser extends users {
      publishers: publishers[];
      golden_players: golden_players | null;
  }




  interface createDifficultyData {
    name: string;
    description: string | null;
    parentModID: number | null;
    parentDifficultyID: number | null;
    order: number;
  }




  interface createTechData {
    name: string;
    description?: string | null;
    difficulties: Object;
  }

  interface updateTechData {
    name?: string;
    description?: string | null;
    difficulties?: Object;
  }

  interface rawTech extends tech_list {
    difficulties: difficulties;
  }


  export { createUserData, updateUserData, rawUser, createDifficultyData, createTechData, updateTechData, rawTech };
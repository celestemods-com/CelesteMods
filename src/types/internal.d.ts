import { users, publishers, golden_players, difficulties } from ".prisma/client";


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

  interface updateDifficultyData {
    name?: string;
    description?: string | null;
    parentModID?: number | null;
    parentDifficultyID?: number | null;
    order?: number;
  }


  export { createUserData, updateUserData, rawUser, createDifficultyData, updateDifficultyData };
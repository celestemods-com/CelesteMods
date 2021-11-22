import { users, publishers, golden_players } from ".prisma/client";


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


  export { createUserData, updateUserData, rawUser };
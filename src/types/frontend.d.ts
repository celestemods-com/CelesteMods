import { difficulties } from ".prisma/client";

interface formattedUser {
  id: number;
  displayName: string;
  discordUsername?: string;
  discordDescrim?: string;
  displayDiscord?: boolean;
  timeCreated?: number;
  permissions?: string;
  accountStatus: string;
  timeDeletedOrBanned?: number;
  gamebananaIDs?: number[];
  goldenPlayerID?: number;
}

interface formattedTech {
  id: number;
  name: string;
  description?: string;
  difficulty: difficulties;
}

export { formattedUser, formattedTech };
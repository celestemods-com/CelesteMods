interface formattedUser {
  id: number;
  displayName: string;
  discordUsername?: string;
  discordDescrim?: string;
  displayDiscord?: boolean;
  timeCreated?: number;
  permissions?: string;
  accountStatus: string;
  timeDeletedOrBanned?: number | null;
  gamebananaIDs?: number[];
  goldenPlayerID?: number;
}

export { formattedUser };
import { type ModType } from "@prisma/client"

export const modTypes: readonly ModType[] = ["Normal", "Collab", "Contest", "LobbyOther"] as const;
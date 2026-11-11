import { z } from "zod";




// this needs to be here to resolve webpack error in ~\src\server\api\routers\user_userClaim\userClaim.ts
export const userIdSchema_NonObject = z.string().min(0).max(100);
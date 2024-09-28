import { z } from 'zod';




// this needs to be here to resolve webpack error in ~\src\server\api\routers\user_userClaim\userClaim.ts
export const userIdSchema_NonObject = z.string().cuid();    //TODO!: figure out if we need to add z.coerce before string()
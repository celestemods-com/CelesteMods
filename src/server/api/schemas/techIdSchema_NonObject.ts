import { z } from "zod";
import { INT_MAX_SIZES } from "~/consts/integerSizes";




// this needs to be here to resolve webpack errors in ~\src\pages\api\panel.ts and ~\src\server\api\routers\tech_techVideo\techVideo.ts
export const techIdSchema_NonObject = z.number().int().gte(1).lte(INT_MAX_SIZES.smallInt.unsigned);
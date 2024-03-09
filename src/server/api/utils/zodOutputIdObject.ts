import { z } from 'zod';




export const zodOutputIdObject = z.object({ id: z.number().int() });
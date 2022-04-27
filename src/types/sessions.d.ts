import { SessionData } from "express-session";  //this import is required so the typescript compiler is happy
import { Cookie } from "express-session"; 


declare module "express-Session" {
    interface SessionData {
        userID?: number;
        refreshCount?: number;
    }
}




export interface sessionData {
  cookie: Required<Cookie>;
  refreshCount: number;
  userID: number;
}
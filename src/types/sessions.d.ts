import { SessionData } from "express-session";  //this import is required so the typescript compiler is happy
import { permissions } from "./internal";


declare module "express-Session" {
  interface SessionData {
    refreshCount?: number;
    userID?: number;
    permissions?: permissions[];
  }
}




export interface sessionData {
  cookie: sessionDataCookie;
  refreshCount: number;
  userID: number;
}


interface sessionDataCookie {
  originalMaxAge: number;
  expires: Date;
  httpOnly: boolean;
  path: string;
  secure: boolean;
  sameSite: "strict";
}

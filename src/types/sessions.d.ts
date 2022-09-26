import { permissions } from "./frontend";


declare module "express-session" {
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

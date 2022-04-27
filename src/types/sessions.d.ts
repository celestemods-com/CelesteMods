import { SessionData } from "express-session";  //this import is required so the typescript compiler is happy
import { Cookie } from "express-session";
import { permissions } from "./internal";


declare module "express-Session" {
  interface SessionData {
    refreshCount?: number;
    userID?: number;
    permissions?: permissions[];
  }
}




export interface sessionData {
  cookie: Required<Cookie>;
  refreshCount: number;
  userID: number;
}
import { SessionData } from "express-session";


declare module "express-Session" {
    export interface SessionData {
        userID?: number;
    }
}
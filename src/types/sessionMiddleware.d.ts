import { SessionData } from "express-session";


declare module "express-Session" {
    interface SessionData {
        userID?: number;
        refreshCount?: number;
    }
}
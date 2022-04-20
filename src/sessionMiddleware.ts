import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from ".//prismaClient";




const sessionStoreOptions: typeof PrismaSessionStore.arguments = {
    checkPeriod: 60 * 60 * 1000,    //1h    //in milliseconds
    stale: false,   //deletes stale cookies without returning them
};


const sessionStore = new PrismaSessionStore(prisma, sessionStoreOptions);





const cookieOptionsObject: typeof session.arguments = {
    path: "/api",
    httpOnly: true,
    sameSite: <"strict">"strict",
};


if (process.env.NODE_ENV === "dev") {
    cookieOptionsObject.maxAge = 30 * 1000;   //lifespan of the cookie in milliseconds
    cookieOptionsObject.secure = false;   //makes cookies visible in postman
}
else {
    cookieOptionsObject.maxAge = 40 * 3600 * 1000;    //40h   //lifespan of the cookie in milliseconds
    cookieOptionsObject.secure = true;
}


export const sessionOptionsObject = {
    cookie: cookieOptionsObject,
    secret: <string>process.env.SESSION_SECRET,
    resave: false,
    rolling: false,
    saveUninitialized: false,
    name: "celestemods.backend.sid",
    store: sessionStore,
    unset: <"destroy">"destroy",
}


export const sessionMiddleware = session(sessionOptionsObject);
import * as dotenv from "dotenv";
dotenv.config({path: "../.env"});

import express from "express";
import cookieParser from "cookie-parser";
import { sessionCookieNameString, sessionMiddleware } from "./middlewaresAndConfigs/sessionMiddleware";
import { helmetMiddleware } from "./middlewaresAndConfigs/helmet";
import { noRouteError, errorHandler } from "./helperFunctions/errorHandling";


export const app = express();


const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});

app.use((req, res, next) => { return helmetMiddleware(req, res, next) });

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);


app.use(express.json());
app.use(cookieParser());


const cookieConsentPath1 = "/api/v1/sessions";
const cookieConsentPath2 = "/api/v1/users";

app.use(function (req, res, next) {
    if (req.cookies[sessionCookieNameString]) {
        return sessionMiddleware(req, res, next);      //if session cookie already exists then run middleware to populate req.session
    }                                                   //otherwise, don't call the middleware so cookies aren't set without consent
    else if (
        req.method === "POST" && (
            req.path === cookieConsentPath1 || req.path === cookieConsentPath1 + "/" ||
            req.path === cookieConsentPath2 || req.path === cookieConsentPath2 + "/"
        )
    ) {
        return sessionMiddleware(req, res, next);     //if this line is reached, the user has consented to a session cookie. so, call the middleware and create one now.
    }


    next();
});



const apiRouter_parent = express.Router();

app.use("/api", apiRouter_parent);


app.use(noRouteError);

app.use(errorHandler);










const apiRouter_v1 = express.Router();

apiRouter_parent.use("/v1", apiRouter_v1);


apiRouter_parent.use(noRouteError);

apiRouter_parent.use(errorHandler);




apiRouter_v1.use(function (req, res, next) {
    try {
        const safeOrigin = "https://celestemods.com";
        const originHeader = req.headers.origin;
        let oneof = false;


        if (originHeader) {
            if (process.env.NODE_ENV === "dev" || originHeader === safeOrigin) {
                res.header("Access-Control-Allow-Origin", originHeader);
                res.header("Access-Control-Allow-Credentials", "true");
            }
            else {
                res.header("Access-Control-Allow-Origin", safeOrigin);
            }

            oneof = true;
        }
        if (req.headers["access-control-request-method"]) {
            res.header("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);

            oneof = true;
        }
        if (req.headers["access-control-request-headers"]) {
            res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);

            oneof = true;
        }

        if (oneof) {
            res.header("Access-Control-Max-Age", "600");
        }

        // intercept OPTIONS method
        if (oneof && req.method == "OPTIONS") {
            res.sendStatus(200);
        }
        else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
});


import { sessionRouter } from "./routes/sessions";
import { difficultiesRouter } from "./routes/difficulties";
import { lengthsRouter } from "./routes/lengths";
import { modsRouter } from "./routes/mods";
import { mapsRouter } from "./routes/maps";
import { publishersRouter } from "./routes/publishers";
import { reviewCollectionsRouter } from "./routes/reviewCollections";
import { ratingsRouter } from "./routes/ratings";
import { reviewsRouter } from "./routes/reviews";
import { mapReviewsRouter } from "./routes/mapReviews";
import { techsRouter } from "./routes/techs";
import { usersRouter } from "./routes/users";

apiRouter_v1.use("/sessions", sessionRouter);
apiRouter_v1.use("/difficulties", difficultiesRouter);
apiRouter_v1.use("/lengths", lengthsRouter);
apiRouter_v1.use("/mods", modsRouter);
apiRouter_v1.use("/maps", mapsRouter);
apiRouter_v1.use("/publishers", publishersRouter);
apiRouter_v1.use("/ratings", ratingsRouter);
apiRouter_v1.use("/reviewcollections", reviewCollectionsRouter);
apiRouter_v1.use("/reviews", reviewsRouter);
apiRouter_v1.use("/mapreviews", mapReviewsRouter);
apiRouter_v1.use("/techs", techsRouter);
apiRouter_v1.use("/users", usersRouter);


apiRouter_v1.use(noRouteError);

apiRouter_v1.use(errorHandler);

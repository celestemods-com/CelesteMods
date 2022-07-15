import express from "express";
import cookieParser from "cookie-parser";
import { sessionCookieNameString, sessionMiddleware } from "./middlewaresAndConfigs/sessionMiddleware";
import { helmetMiddleware } from "./middlewaresAndConfigs/helmet";
import { noRouteError, errorHandler } from "./helperFunctions/errorHandling";


export const app = express();
app.use((req, res, next) => { return helmetMiddleware(req, res, next) });
app.use(express.json());

const apiRouter_parent = express.Router();
const apiRouter_v1 = express.Router();


const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});


if (process.env.NODE_ENV !== "dev") {
    app.set("trust proxy", 1);   //TODO: figure out if this is needed during deployment. if express is behind a proxy this will be required to enable HTTPS.
}


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


app.use("/api", apiRouter_parent);


app.use(noRouteError);

app.use(errorHandler);










apiRouter_parent.use("/v1", apiRouter_v1);


apiRouter_parent.use(noRouteError);

apiRouter_parent.use(errorHandler);




apiRouter_v1.use(function (req, res, next) {
    try {
        let oneof = false;
        if (req.headers.origin) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);

            oneof = true;


            const safeOrigin = "https://celestemods.com";

            if (process.env.NODE_ENV === "dev" || req.headers.origin === safeOrigin) {
                res.header("Access-Control-Allow-Credentials", "true");
            }
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
            //req.openCors = true;
            next();
        }
    }
    catch (error) {
        next(error);
    }
});


import { sessionRouter } from "./routes/sessions";
import { difficultiesRouter } from "./routes/difficulties";
import { goldensRouter, goldenPlayersRouter, goldenRunsRouter, goldenSubmissionsRouter } from "./routes/goldens";
import { lengthsRouter } from "./routes/lengths";
import { modsRouter } from "./routes/mods";
import { mapsRouter } from "./routes/maps";
import { publishersRouter } from "./routes/publishers";
import { ratingsRouter } from "./routes/ratings";
import { reviewsRouter } from "./routes/reviews";
import { techsRouter } from "./routes/techs";
import { usersRouter } from "./routes/users";

apiRouter_v1.use("/sessions", sessionRouter);
apiRouter_v1.use("/difficulties", difficultiesRouter);
apiRouter_v1.use("/goldens", goldensRouter);
apiRouter_v1.use("/goldenplayers", goldenPlayersRouter);
apiRouter_v1.use("/goldenruns", goldenRunsRouter);
apiRouter_v1.use("/goldensubmissions", goldenSubmissionsRouter);
apiRouter_v1.use("/lengths", lengthsRouter);
apiRouter_v1.use("/mods", modsRouter);
apiRouter_v1.use("/maps", mapsRouter);
apiRouter_v1.use("/publishers", publishersRouter);
apiRouter_v1.use("/ratings", ratingsRouter);
apiRouter_v1.use("/reviews", reviewsRouter);
apiRouter_v1.use("/techs", techsRouter);
apiRouter_v1.use("/users", usersRouter);


apiRouter_v1.use(noRouteError);

apiRouter_v1.use(errorHandler);

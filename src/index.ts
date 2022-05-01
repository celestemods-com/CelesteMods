import express from "express";
import cookieParser from "cookie-parser"
import { sessionCookieNameString, sessionMiddleware } from "./sessionMiddleware";
import { noRouteError, errorHandler } from "./errorHandling";
import sessionTypeExtensions from "./types/sessions";  //need to import this here so the compiler knows about it right away


export const app = express();
app.use(express.json());

const apiRouter = express.Router();


const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});


if (process.env.NODE_ENV !== "dev") {
    app.set("trust proxy", 1);   //TODO: figure out if this is needed during deployment. if express is behind a proxy this will be required to enable HTTPS.
}


app.use(cookieParser());


// app.use(sessionMiddleware)               //for testing
// app.use((req, res, next) => {
//     req.session.userID = 1;
//     res.json(`req.session.cookie.expires: ${req.session.cookie.expires}
//     req.session.cookie.maxAge: ${req.session.cookie.maxAge}
//     req.session.cookie.originalMaxAge: ${req.session.cookie.originalMaxAge}`)
// })


app.use(function (req, _res, next) {
    if (req.cookies[sessionCookieNameString]) {
        app.use(sessionMiddleware);     //if session cookie already exists then run middleware to populate req.session
    }                                   //otherwise, don't call the middleware so cookies aren't set without consent


    next();
});


app.use("api/v1", apiRouter);


app.use(noRouteError);

app.use(errorHandler);










apiRouter.use(function (req, res, next) {
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
import { reviewsRouter, ratingsRouter } from "./routes/reviews-ratings";
import { techsRouter } from "./routes/techs";
import { usersRouter } from "./routes/users";

apiRouter.use("/sessions", sessionRouter);
apiRouter.use("/difficulties", difficultiesRouter);
apiRouter.use("/goldens", goldensRouter);
apiRouter.use("/goldenplayers", goldenPlayersRouter);
apiRouter.use("/goldenruns", goldenRunsRouter);
apiRouter.use("/goldensubmissions", goldenSubmissionsRouter);
apiRouter.use("/lengths", lengthsRouter);
apiRouter.use("/mods", modsRouter);
apiRouter.use("/maps", mapsRouter);
apiRouter.use("/publishers", publishersRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/ratings", ratingsRouter);
apiRouter.use("/techs", techsRouter);
apiRouter.use("/users", usersRouter);


apiRouter.use(noRouteError);

apiRouter.use(errorHandler);
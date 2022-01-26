import express from "express";
import { noRouteError, errorHandler } from "./errorHandling";


const app = express();
app.use(express.json());

const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});


app.use( function (req, res, next) {
    try {
        let oneof = false;
        if (req.headers.origin) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);

            oneof = true;


            const safeOrigin =  "https://celestemods.com";

            if(process.env.NODE_ENV === "dev" || req.headers.origin === safeOrigin) {
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
            res.header("Access-Control-Max-Age", "600" );
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


import { difficultiesRouter } from "./routes/difficulties";
import { goldensRouter, goldenPlayersRouter, goldenRunsRouter, goldenSubmissionsRouter } from "./routes/goldens";
import { lengthsRouter } from "./routes/lengths";
import { modsRouter, mapsRouter, publishersRouter } from "./routes/maps-mods-publishers";
import { reviewsRouter, ratingsRouter } from "./routes/reviews-ratings";
import { techsRouter } from "./routes/techs";
import { usersRouter } from "./routes/users";

app.use("/difficulties", difficultiesRouter);
app.use("/goldens", goldensRouter);
app.use("/goldenplayers", goldenPlayersRouter);
app.use("/goldenruns", goldenRunsRouter);
app.use("/goldensubmissions", goldenSubmissionsRouter);
app.use("/lengths", lengthsRouter);
app.use("/mods", modsRouter);
app.use("/maps", mapsRouter);
app.use("/publishers", publishersRouter);
app.use("/reviews", reviewsRouter);
app.use("/ratings", ratingsRouter);
app.use("/techs", techsRouter);
app.use("/users", usersRouter);


app.use(noRouteError);

app.use(errorHandler);
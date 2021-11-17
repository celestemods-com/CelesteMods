import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

import express from "express";
const app = express();
app.use(express.json());
const port = process.env.PORT || "3001";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});

import {difficultiesRouter} from "./routes/difficulties";
import {gfSubmissionsRouter, gfVotesRouter} from "./routes/generalfeedback";
import {goldensRouter, goldenPlayersRouter, goldenRunsRouter, goldenSubmissionsRouter} from "./routes/goldens";
import {lengthsRouter} from "./routes/lengths";
import {modsRouter, mapsRouter, publishersRouter, mSubmissionsRouter} from "./routes/maps-mods-publishers";
import {reviewsRouter, ratingsRouter} from "./routes/reviews-ratings";
import {techsRouter} from "./routes/techs";
import {usersRouter} from "./routes/users";

app.use("/difficulties", difficultiesRouter);
app.use("/gfsubmissions", gfSubmissionsRouter);
app.use("/gfvotes", gfVotesRouter);
app.use("/goldens", goldensRouter);
app.use("/goldenplayers", goldenPlayersRouter);
app.use("/goldenruns", goldenRunsRouter);
app.use("/goldensubmissions", goldenSubmissionsRouter);
app.use("/lengths", lengthsRouter);
app.use("/mods", modsRouter);
app.use("/maps", mapsRouter);
app.use("/publishers", publishersRouter);
app.use("/msubmissions", mSubmissionsRouter);
app.use("/reviews", reviewsRouter);
app.use("/ratings", ratingsRouter);
app.use("/techs", techsRouter);
app.use("/users", usersRouter);
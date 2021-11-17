import express from "express";
const goldensRouter = express.Router();
const playersRouter = express.Router();
const runsRouter = express.Router();
const subsRouter = express.Router();


goldensRouter.route("")

export {goldensRouter, playersRouter as goldenPlayersRouter, runsRouter as goldenRunsRouter, subsRouter as goldenSubmissionsRouter};
import express from "express";
const modsRouter = express.Router();
const mapsRouter = express.Router();
const publishersRouter = express.Router();
const subsRouter = express.Router();


modsRouter.route("")

export {modsRouter, mapsRouter, publishersRouter, subsRouter as mSubmissionsRouter};
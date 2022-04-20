import express from "express";
import axios from "axios";
import { prisma } from "../prismaClient";
import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";


const router = express.Router();
export { router as authRouter };

//TODO: implement authentication/session flows, add functionality to POST /users to allow for session generation, and implement partial vs full user object stuff in /users




router.route("/discord")
    .get(async function (req, res, next) {
        try{
            const urlRoot = "https://discord.com/api/oauth2/authorize?";
            const discordClientID = "client_id=" + <string> process.env.DISCORD_CLIENT_ID;
            const redirectUri = "redirect_uri=" + encodeURIComponent(<string> process.env.DISCORD_REDIRECT_URI);
            const responseType = "response_type=code";
            const scope = "scope=identify";


            const url = urlRoot + [discordClientID, redirectUri, responseType, scope].join("&");


            res.json(url);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/refresh")
    .post(async function (req, res, next) {
        try{

        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/revoke/session")
    .post(async function (req, res, next) {
        try{

        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {

})


router.route("/revoke/user/:userID")
    .post(async function (req, res, next) {
        try{

        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/")
    .post(async function (req, res, next) {
        try{

        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);
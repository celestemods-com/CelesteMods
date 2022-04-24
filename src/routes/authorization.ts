import express from "express";
import axios from "axios";
import { prisma } from "../prismaClient";
import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { getDiscordUser, noUserWithDiscordIdErrorMessage, regenerateSessionAsync, revokeSessionAsync, storeIdentityInSession } from "../helperFunctions/authorization";
import { formatFullUser, param_userID } from "../helperFunctions/users";


const router = express.Router();
export { router as authRouter };




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

            let refreshCount = req.session.refreshCount;

            if (refreshCount === undefined) throw "refreshCount is undefined";

            else if (refreshCount >= 20) res.status(403).json("Maximum refreshCount has been reached. Please use /authorization to generate a new session.");


            await regenerateSessionAsync(req);


            refreshCount++;
            req.session.refreshCount = refreshCount;


            const sessionExpiryTime = req.session.cookie.expires;


            const responseObject = {
                sessionExpiryTime: sessionExpiryTime,
                refreshCount: refreshCount,
            };

            
            res.status(200).json(responseObject);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/revoke/session")
    .post(async function (req, res, next) {
        try{
            await revokeSessionAsync(req);


            res.sendStatus(200);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    param_userID(req, res, next);
})


router.route("/revoke/user/:userID")
    .post(async function (req, res, next) {
        try{
            const userID = <number>req.id2;

            const sessionIDs: string[] = ["fhsdkjfhsa", "fahkjfhsdlfh"]   //TODO: implement actually getting all of the user's SIDs from the sessionStore


            await Promise.all(
                sessionIDs.map(                 //.forEach caused an error so used .map instead
                    async (sessionID) => {
                        await revokeSessionAsync(req, sessionID);
                    }
                )
            );


            res.sendStatus(200);
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.route("/sessions")
    .get(async function (req, res, next) {
        try {
            //TODO: implement this
        }
        catch (error) {
            next(toErrorWithMessage(error));
        }
    })
    .all(noRouteError);




router.route("/")
    .post(async function (req, res, next) {
        try{
                const discordTokenType: string = req.body.discordTokenType;
                const discordToken: string = req.body.discordToken;

                if (typeof discordToken !== "string" || typeof discordTokenType !== "string") {
                    res.status(400).json("Malformed request body");
                    return;
                }


                const discordUser = await getDiscordUser(res, discordTokenType, discordToken);

                if (!discordUser) return;
                else if (isErrorWithMessage(discordUser)) throw discordUser;


                const rawUser = await storeIdentityInSession(req, discordUser, true);

                if (isErrorWithMessage(rawUser)) throw rawUser;
                
                if (typeof rawUser === "boolean") throw "authorization POST didn't update discordUser info";

                if (!req.session.userID) throw "No req.session.userID";


                const formattedUser = formatFullUser(rawUser);
                
                if (isErrorWithMessage(formattedUser)) throw formattedUser;


                const sessionExpiryTime = req.session.cookie.expires;
                const refreshCount = req.session.refreshCount ? req.session.refreshCount : 0;


                const responseObject = {
                    sessionExpiryTime: sessionExpiryTime,
                    refreshCount: refreshCount,
                    celestemodsUser: formattedUser,
                };


                res.json(responseObject);
        }
        catch (error) {
            if (isErrorWithMessage(error)) {
                if (error.message = noUserWithDiscordIdErrorMessage) {
                    res.status(404).json(noUserWithDiscordIdErrorMessage);
                    return;
                }
            }


            next(toErrorWithMessage(error));
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);
import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { checkPermissions, checkSessionAge, mapStaffPermsArray } from "../helperFunctions/sessions";
import { param_modID, param_mapID } from "../helperFunctions/maps-mods-publishers";
import { param_userID } from "../helperFunctions/users";
import { formatMapReviews, formatMapReview, param_mapReviewID } from "../helperFunctions/reviewCollections-reviews-mapReviews";
import { formatRating } from "../helperFunctions/ratings";
import { getCurrentTime } from "../helperFunctions/utils";
import { getLengthID, lengthErrorMessage } from "../helperFunctions/lengths";

import { validateMapReviewPost, validateMapReviewPatch } from "../jsonSchemas/reviewCollections-reviews-mapReviews";

import { expressRoute } from "../types/express";
import {
    createMapReviewDataStandalone, createRatingData, mapReviewPatchDataObject, rawMapReview, rawRating, rawReview, updateRatingDataConnectDifficulty, updateRatingDataNullDifficulty
} from "../types/internal";


const router = express.Router();
export { router as mapReviewsRouter };




export const invalidMapIDError = "Invalid mapID";
export const invalidLengthIDError = "Invalid lengthID";




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawMapReviews = await prisma.reviews_maps.findMany({
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                }
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .all(noRouteError);


router.route("/search/map")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { maps_ids: { maps_details: { some: { name: { startsWith: query } } } } },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);


router.route("/search/user")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { review_collections: { users: { displayName: { startsWith: query } } } } },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
    param_modID(req, res, next);
});


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { modID: modID } },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", async function (req, res, next) {
    param_mapID(req, res, next);
});


router.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {
            const mapID = <number>req.id;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { mapID: mapID },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    param_userID(req, res, next);
});


router.route("/user/:userID")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            const rawMapReviews = await prisma.reviews_maps.findMany({
                where: { reviews: { review_collections: { userID: userID } } },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReviews = await formatMapReviews(rawMapReviews);


            res.json(formattedMapReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapReviewID", async function (req, res, next) {
    param_mapReviewID(req, res, next);
});


router.route("/:mapReviewID")
    .get(async function (req, res, next) {
        try {
            const rawMapReview = <rawMapReview>req.mapReview;


            const formattedMapReview = await formatMapReview(rawMapReview);

            if (isErrorWithMessage(formattedMapReview)) throw formattedMapReview;


            res.json(formattedMapReview);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const mapReviewFromID = <rawMapReview>req.mapReview;
            const userID = mapReviewFromID.reviews.review_collections.userID;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            const lengthName: string | undefined = req.body.length === null ? undefined : req.body.length;
            const likes: string | null | undefined = req.body.likes;
            const dislikes: string | null | undefined = req.body.dislikes;
            const otherComments: string | null | undefined = req.body.otherComments;
            const displayRatingBool: boolean | undefined = req.body.displayRating === null ? undefined : req.body.displayRating;
            const currentTime = getCurrentTime();


            const valid = validateMapReviewPatch({
                lengthName: lengthName,
                likes: likes,
                dislikes: dislikes,
                otherComments: otherComments,
                displayRatingBool: displayRatingBool,
            });

            if (!valid || (!lengthName && likes === undefined && dislikes === undefined && otherComments === undefined && displayRatingBool === undefined)) {
                res.status(400).json("Malformed request body");
                return;
            }



            const patchData: mapReviewPatchDataObject = {
                likes: likes,
                dislikes: dislikes,
                otherComments: otherComments,
                displayRatingBool: displayRatingBool,
                reviews: { update: { timeSubmitted: currentTime } },
            };

            if (lengthName) {
                try {
                    const lengthID = await getLengthID(lengthName); //could throw an error

                    patchData.map_lengths = { connect: { id: lengthID } };
                }
                catch (error) {
                    if (error === lengthErrorMessage) {
                        res.status(400).json(lengthErrorMessage);
                        return;
                    }
                    else {
                        throw error;
                    }
                }
            }


            const rawMapReview = await prisma.reviews_maps.update({
                where: { id: id },
                data: patchData,
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });


            const formattedMapReview = await formatMapReview(rawMapReview);

            if (isErrorWithMessage(formattedMapReview)) throw formattedMapReview;


            res.status(200).json(formattedMapReview);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const rawMapReview = <rawMapReview>req.mapReview;
            const userID = rawMapReview.reviews.review_collections.userID;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.reviews_maps.delete({ where: { id: id } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);




export const mapReviewPost = <expressRoute>async function (req, res, next) {    //called from ./reviews.ts
    try {
        const reviewID = req.id!;
        const mapID: number = req.body.mapID;
        const lengthID: number = req.body.lengthID;
        const likes: string | undefined = req.body.likes;
        const dislikes: string | undefined = req.body.dislikes;
        const otherComments: string | undefined = req.body.otherComments;
        const displayRatingBool: boolean = req.body.displayRating;
        const quality: number | null = req.body.quality === undefined ? null : req.body.quality;
        const difficultyID: number | undefined = req.body.difficultyID === null ? undefined : req.body.difficultyID;
        const currentTime = getCurrentTime();


        const valid = validateMapReviewPost({
            mapID: mapID,
            lengthID: lengthID,
            likes: likes,
            dislikes: dislikes,
            otherComments: otherComments,
            displayRating: displayRatingBool,
            quality: quality,
            difficultyID: difficultyID,
        });

        if (!valid) {
            res.status(400).json("Malformed request body");
            return;
        }


        const rawMapReviewAndRatingAndStatus: [rawMapReview, rawRating | undefined, number] | undefined = await prisma.$transaction(async () => {
            //check that user hasn't already submitted a mapReview for this map
            const rawMatchingMapReview = await prisma.reviews_maps.findUnique({
                where: {
                    reviewID_mapID: {
                        reviewID: reviewID,
                        mapID: mapID,
                    },
                },
                include: {
                    map_lengths: true,
                    reviews: { select: { review_collections: { select: { userID: true } } } },
                },
            });

            if (rawMatchingMapReview) return <[rawMapReview, undefined, number]>[rawMatchingMapReview, undefined, 200];


            //check that mapID is valid and that the map is part of the mod linked to the parent review
            const reviewFromID = await prisma.reviews.findUnique({
                where: { id: reviewID },
                include: {
                    mods_ids: {
                        include: {
                            maps_ids: true,
                        },
                    },
                },
            });

            if (!reviewFromID) throw `reviewFromID is null for review ${reviewID}`;


            let validMapID = false;

            for (const map_id of reviewFromID.mods_ids.maps_ids) {
                if (map_id.id === mapID) {
                    validMapID = true;
                    break;
                }
            }

            if (!validMapID) {
                res.status(404).json(`mapID does not match any maps in mod ${reviewFromID.modID}`);
                res.errorSent = true;
                throw invalidMapIDError;
            }

                                
            const lengthFromID = await prisma.map_lengths.findUnique({ where: { id: lengthID } });

            if (!lengthFromID) {
                res.status(404).json(`lengthID ${lengthID} does not match any lengths in the database`);
                res.errorSent = true;
                throw invalidLengthIDError;
            }


            const createMapReviewDataObject: createMapReviewDataStandalone = {
                reviews: { connect: { id: reviewID } },
                maps_ids: { connect: { id: mapID } },
                map_lengths: { connect: { id: lengthID } },
                likes: likes,
                dislikes: dislikes,
                otherComments: otherComments,
                displayRatingBool: displayRatingBool,
            };

            let rawMapReview: rawMapReview;
            let rawRating: rawRating;

            if (quality || difficultyID) {
                const reviewFromID = <rawReview>req.review;
                const userID = reviewFromID.review_collections.userID;


                const createRatingDataObject: createRatingData = {
                    maps_ids: { connect: { id: mapID } },
                    users: { connect: { id: userID } },
                    timeSubmitted: currentTime,
                    quality: quality,
                };


                let updateRatingDataObject: updateRatingDataConnectDifficulty | updateRatingDataNullDifficulty;

                if (difficultyID) {
                    createRatingDataObject.difficulties = { connect: { id: difficultyID } };

                    updateRatingDataObject = {
                        timeSubmitted: currentTime,
                        quality: quality,
                        difficulties: { connect: { id: difficultyID } },
                    };
                }
                else {
                    updateRatingDataObject = {
                        timeSubmitted: currentTime,
                        quality: quality,
                        difficultyID: null,
                    }
                }


                await Promise.all([
                    rawMapReview = await prisma.reviews_maps.create({
                        data: createMapReviewDataObject,
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    }),
                    rawRating = await prisma.ratings.upsert({
                        create: createRatingDataObject,
                        update: updateRatingDataObject,
                        where: {
                            mapID_submittedBy: {
                                mapID: mapID,
                                submittedBy: userID,
                            },
                        },
                        include: { difficulties: true },
                    }),
                ]);


                return <[rawMapReview, rawRating, number]>[rawMapReview, rawRating, 201];
            }
            else {
                rawMapReview = await prisma.reviews_maps.create({
                    data: createMapReviewDataObject,
                    include: {
                        map_lengths: true,
                        reviews: { select: { review_collections: { select: { userID: true } } } },
                    },
                });


                return <[rawMapReview, undefined, number]>[rawMapReview, undefined, 201];
            }
        });


        if (!rawMapReviewAndRatingAndStatus) {
            if (res.errorSent) return;

            throw "no rawMapReviewAndRatingAndStatus";
        }


        const rawMapReview = rawMapReviewAndRatingAndStatus[0];
        const rawRating = rawMapReviewAndRatingAndStatus[1];
        const status = rawMapReviewAndRatingAndStatus[2];


        const formattedMapReview = await formatMapReview(rawMapReview);

        if (isErrorWithMessage(formattedMapReview)) throw formattedMapReview;


        if (rawRating) {
            const formattedRating = formatRating(rawRating);

            if (isErrorWithMessage(formattedRating)) throw formattedRating;


            res.status(status).json([formattedMapReview, formattedRating]);
        }
        else {
            res.status(status).json([formattedMapReview]);
        }
    }
    catch (error) {
        if (res.errorSent) return;
        next(error);
    }
}
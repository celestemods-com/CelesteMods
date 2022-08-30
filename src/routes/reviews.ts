import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../helperFunctions/errorHandling";
import { mapReviewPost } from "./mapReviews";
import { formatReview, formatReviews, param_reviewID } from "../helperFunctions/reviewCollections-reviews-mapReviews";
import { formatRatings } from "../helperFunctions/ratings";
import { param_modID } from "../helperFunctions/maps-mods-publishers";
import { checkPermissions, checkSessionAge, mapReviewersPermsArray, mapStaffPermsArray } from "../helperFunctions/sessions";
import { param_userID } from "../helperFunctions/users";
import { getCurrentTime } from "../helperFunctions/utils";
import { getLengthID, lengthErrorMessage } from "../helperFunctions/lengths";

import { validateReviewPatch, validateReviewPost } from "../jsonSchemas/reviewCollections-reviews-mapReviews";

import {
    createMapReviewData, createRatingData, createReviewData, jsonCreateMapReviewWithReview, rawRating, rawReview, updateRatingDataConnectDifficulty,
    updateRatingDataNullDifficulty
} from "../types/internal";
import { expressRoute } from "../types/express";


const router = express.Router();
export { router as reviewsRouter };




const invalidMapStringError = "invalid mapID";




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawReviews = await prisma.reviews.findMany({
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReviews = await formatReviews(rawReviews);


            res.json(formattedReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .all(noRouteError);


router.route("/search/mod")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawReviews = await prisma.reviews.findMany({
                where: { mods_ids: { mods_details: { some: { name: { startsWith: query } } } } },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReviews = await formatReviews(rawReviews);


            res.json(formattedReviews);
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


            const rawReviews = await prisma.reviews.findMany({
                where: { review_collections: { users: { displayName: { startsWith: query } } } },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReviews = await formatReviews(rawReviews);


            res.json(formattedReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
    try {
        param_modID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const modID = <number>req.id;


            const rawReviews = await prisma.reviews.findMany({
                where: { modID: modID },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReviews = await formatReviews(rawReviews);


            res.json(formattedReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("userID", async function (req, res, next) {
    try {
        param_userID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/user/:userID")
    .get(async function (req, res, next) {
        try {
            const userID = <number>req.id2;


            const rawReviews = await prisma.reviews.findMany({
                where: { review_collections: { userID: userID } },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReviews = await formatReviews(rawReviews);


            res.json(formattedReviews);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("reviewID", async function (req, res, next) {
    try {
        param_reviewID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/:reviewID")
    .get(async function (req, res, next) {
        try {
            const rawReview = <rawReview>req.review;


            const formattedReview = await formatReview(rawReview);

            if (isErrorWithMessage(formattedReview)) throw formattedReview;


            res.status(200).json(formattedReview);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            console.log("entered review patch")
            const id = <number>req.id;
            const reviewFromID = <rawReview>req.review;
            const userID = reviewFromID.review_collections.userID;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            const likes: string | null | undefined = req.body.likes;
            const dislikes: string | null | undefined = req.body.dislikes;
            const otherComments: string | null | undefined = req.body.otherComments;
            const currentTime = getCurrentTime();


            const valid = validateReviewPatch({
                likes: likes,
                dislikes: dislikes,
                otherComments: otherComments,
            });

            if (!valid || (likes === undefined && dislikes === undefined && otherComments === undefined)) {
                res.status(400).json("Malformed request body");
                return;
            }
            console.log("passed json validation")


            const rawReview = await prisma.reviews.update({
                where: { id: id },
                data: {
                    timeSubmitted: currentTime,
                    likes: likes,
                    dislikes: dislikes,
                    otherComments: otherComments,
                },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });


            const formattedReview = await formatReview(rawReview);

            if (isErrorWithMessage(formattedReview)) throw formattedReview;


            res.status(200).json(formattedReview);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const id = <number>req.id;
            const rawReview = <rawReview>req.review;
            const userID = rawReview.review_collections.userID;


            let permitted: boolean;

            if (req.session && req.session.userID && req.session.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.reviews.delete({ where: { id: id } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        const permission = await checkPermissions(req, mapReviewersPermsArray, true, res);
        if (!permission) return;


        await mapReviewPost(req, res, next);
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);




export const reviewPost = <expressRoute>async function (req, res, next) {   //called from reviewCollections.ts
    try {
        const permission = await checkPermissions(req, mapReviewersPermsArray, true, res);
        if (!permission) return;


        const userID = req.session.userID!;
        const modID = <number>req.body.modID;
        const reviewCollectionID = req.reviewCollection!.id;
        const likes: string | undefined = req.body.likes === null ? undefined : req.body.likes;
        const dislikes: string | undefined = req.body.dislikes === null ? undefined : req.body.dislikes;
        const otherComments: string | undefined = req.body.otherComments === null ? undefined : req.body.otherComments;
        const jsonMapReviews: jsonCreateMapReviewWithReview[] | undefined = req.body.mapReviews === null ? undefined : req.body.mapReviews;
        const currentTime = getCurrentTime();


        const valid = validateReviewPost({
            modID: modID,
            likes: likes,
            dislikes: dislikes,
            otherComments: otherComments,
            mapReviews: jsonMapReviews,
        });

        if (!valid) {
            res.status(400).json("Malformed request body");
            return;
        }


        const rawReviewAndRatingsAndStatus: [rawReview, rawRating[] | undefined, number] | undefined = await prisma.$transaction(async () => {
            const modFromID = await prisma.mods_ids.findUnique({
                where: { id: modID },
                include: { maps_ids: true },
            });

            if (!modFromID) {
                res.status(404).json(`modID does not match any mods in the celestemods.com database`);
                res.errorSent = true;
                return;
            }


            const rawMatchingReview = await prisma.reviews.findUnique({
                where: {
                    modID_reviewCollectionID: {
                        modID: modID,
                        reviewCollectionID: reviewCollectionID,
                    },
                },
                include: {
                    review_collections: { select: { userID: true } },
                    reviews_maps: {
                        include: {
                            map_lengths: true,
                            reviews: { select: { review_collections: { select: { userID: true } } } },
                        },
                    },
                },
            });

            if (rawMatchingReview) return <[rawReview, undefined, number]>[rawMatchingReview, undefined, 200];


            const createReviewDataObject: createReviewData = {
                mods_ids: { connect: { id: modID } },
                review_collections: { connect: { id: reviewCollectionID } },
                timeSubmitted: currentTime,
                likes: likes,
                dislikes: dislikes,
                otherComments: otherComments,
            };


            if (jsonMapReviews && jsonMapReviews.length) {
                const ratingsUpsertArray: [createRatingData, updateRatingDataConnectDifficulty | updateRatingDataNullDifficulty, number][] = [];
                let mapReviewsCreationArray: createMapReviewData[];


                try {
                    mapReviewsCreationArray = await Promise.all(
                        jsonMapReviews.map(
                            async (jsonMapReview) => {
                                const mapID = jsonMapReview.mapID;
                                const lengthName = jsonMapReview.length;
                                const likes = jsonMapReview.likes;
                                const dislikes = jsonMapReview.dislikes;
                                const otherComments = jsonMapReview.otherComments;
                                const displayRatingBool = jsonMapReview.displayRating;
                                const quality = jsonMapReview.quality;
                                const difficultyID = jsonMapReview.difficultyID;


                                let validMapID = false;

                                for (const map_id of modFromID.maps_ids) {
                                    if (map_id.id === mapID) {
                                        validMapID = true;
                                        break;
                                    }
                                }

                                if (!validMapID) {
                                    res.status(404).json(`mapID ${mapID} does not match any maps in mod ${modID}`);
                                    res.errorSent = true;
                                    throw invalidMapStringError;
                                }


                                let lengthID: number;

                                try {
                                    lengthID = await getLengthID(lengthName);
                                }
                                catch (error) {
                                    if (error === lengthErrorMessage) {
                                        res.status(400).json(lengthErrorMessage);
                                        res.errorSent = true;
                                        throw lengthErrorMessage;
                                    }
                                    else {
                                        throw error;
                                    }
                                }


                                const createMapReviewDataObject: createMapReviewData = {
                                    maps_ids: { connect: { id: mapID } },
                                    map_lengths: { connect: { id: lengthID } },
                                    likes: likes,
                                    dislikes: dislikes,
                                    otherComments: otherComments,
                                    displayRatingBool: displayRatingBool,
                                };


                                if (quality || difficultyID) {
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


                                    ratingsUpsertArray.push([createRatingDataObject, updateRatingDataObject, mapID]);
                                }


                                return createMapReviewDataObject;
                            }
                        )
                    );
                }
                catch (error) {
                    if (error === invalidMapStringError) return;
                    else if (error === lengthErrorMessage) return;
                    throw error;
                }


                createReviewDataObject.reviews_maps = { create: mapReviewsCreationArray };


                let rawRatings: rawRating[];
                let rawReview: rawReview;


                await Promise.all([
                    rawReview = await prisma.reviews.create({
                        data: createReviewDataObject,
                        include: {
                            review_collections: { select: { userID: true } },
                            reviews_maps: {
                                include: {
                                    map_lengths: true,
                                    reviews: { select: { review_collections: { select: { userID: true } } } },
                                },
                            },
                        },
                    }),
                    rawRatings = await Promise.all(
                        ratingsUpsertArray.map(async ([createRatingDataObject, updateRatingDataObject, mapID]) => {
                            const rawRating = await prisma.ratings.upsert({
                                create: createRatingDataObject,
                                update: updateRatingDataObject,
                                where: {
                                    mapID_submittedBy: {
                                        mapID: mapID,
                                        submittedBy: userID,
                                    },
                                },
                                include: { difficulties: true },
                            });


                            return rawRating;
                        })
                    )
                ]);


                return <[rawReview, rawRating[], number]>[rawReview, rawRatings, 201];
            }
            else {
                const rawReview = await prisma.reviews.create({
                    data: createReviewDataObject,
                    include: {
                        reviews_maps: {
                            include: {
                                map_lengths: true,
                                reviews: { select: { review_collections: { select: { userID: true } } } },
                            },
                        },
                    },
                });


                return <[rawReview, undefined, number]>[rawReview, undefined, 201];
            }
        });


        if (!rawReviewAndRatingsAndStatus) {
            if (res.errorSent) return;

            throw "no rawReviewAndRatingsAndStatus";
        }


        const rawReview = rawReviewAndRatingsAndStatus[0];
        const rawRatings = rawReviewAndRatingsAndStatus[1];
        const status = rawReviewAndRatingsAndStatus[2];


        const formattedReview = await formatReview(rawReview);

        if (isErrorWithMessage(formattedReview)) throw formattedReview;


        if (rawRatings) {
            const formattedRatings = formatRatings(rawRatings);


            res.status(status).json([formattedReview, formattedRatings]);
        }
        else {
            res.status(status).json([formattedReview]);
        }
    }
    catch (error) {
        next(error);
    }
}
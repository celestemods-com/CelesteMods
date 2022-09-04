import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { isErrorWithMessage, toErrorWithMessage } from "./errorHandling";
import { formatRating } from "./ratings";

import { rawReviewCollection, rawReview, rawMapReview } from "../types/internal";
import { formattedReview, formattedMapReview, formattedReviewCollection } from "../types/frontend";
import { expressRoute } from "../types/express";




export const formatReviewCollections = async function (rawReviewCollections: rawReviewCollection[]) {
    const formattedReviewCollections = await Promise.all(
        rawReviewCollections.map(
            async (rawReviewCollection) => {
                const formattedReviewCollection = await formatReviewCollection(rawReviewCollection);

                if (isErrorWithMessage(formattedReviewCollection)) return `Error encountered formatting reviewCollection ${rawReviewCollection.id}`;


                return formattedReviewCollection;
            }
        )
    );


    return formattedReviewCollections;
}


export const formatReviewCollection = async function (rawReviewCollection: rawReviewCollection) {
    const id = rawReviewCollection.id;
    const userID = rawReviewCollection.userID;
    const name = rawReviewCollection.name;
    const description = rawReviewCollection.description;
    const rawReviews = rawReviewCollection.reviews;


    const formattedReviewCollection: formattedReviewCollection = {
        id: id,
        userID: userID,
        name: name,
        description: description,
    }


    if (rawReviews.length) {
        const formattedReviews = await formatReviews(rawReviews);

        formattedReviewCollection.reviews = formattedReviews;
    }


    return formattedReviewCollection;
}




export const formatReviews = async function (rawReviews: rawReview[]) {
    const formattedReviews = await Promise.all(
        rawReviews.map(
            async (rawReview) => {
                const formattedReview = await formatReview(rawReview);

                if (isErrorWithMessage(formattedReview)) return `Error encountered formatting review ${rawReview.id}`;


                return formattedReview;
            }
        )
    );


    return formattedReviews;
}


export const formatReview = async function (rawReview: rawReview) {
    try {
        const id = rawReview.id;
        const modID = rawReview.modID;
        const reviewCollectionID = rawReview.reviewCollectionID;
        const timeSubmitted = rawReview.timeSubmitted;
        const likes = rawReview.likes;
        const dislikes = rawReview.dislikes;
        const otherComments = rawReview.otherComments;
        const rawMapReviews = rawReview.reviews_maps;


        const formattedReview: formattedReview = {
            id: id,
            modID: modID,
            reviewCollectionID: reviewCollectionID,
            timeSubmitted: timeSubmitted,
        }


        if (likes) formattedReview.likes = likes;
        if (dislikes) formattedReview.dislikes = dislikes;
        if (otherComments) formattedReview.otherComments = otherComments;


        if (rawMapReviews.length) {
            const formattedMapReviews = await formatMapReviews(rawMapReviews);

            formattedReview.mapReviews = formattedMapReviews;
        }


        return formattedReview;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const formatMapReviews = async function (rawMapReviews: rawMapReview[]) {
    const formattedMapReviews = await Promise.all(
        rawMapReviews.map(
            async (rawMapReview) => {
                const formattedMapReview = await formatMapReview(rawMapReview);

                if (isErrorWithMessage(formattedMapReview)) return `Error encountered formatting mapReview ${rawMapReview.id}`;

                return formattedMapReview;
            }
        )
    );


    return formattedMapReviews;
}


export const formatMapReview = async function (rawMapReview: rawMapReview) {
    try {
        const id = rawMapReview.id;
        const reviewID = rawMapReview.reviewID;
        const mapID = rawMapReview.mapID;
        const lengthID = rawMapReview.map_lengths.id;
        const displayRatingBool = rawMapReview.displayRatingBool;
        const likes = rawMapReview.likes;
        const dislikes = rawMapReview.dislikes;
        const otherComments = rawMapReview.otherComments;


        const formattedMapReview: formattedMapReview = {
            id: id,
            reviewID: reviewID,
            mapID: mapID,
            lengthID: lengthID,
            displayRating: displayRatingBool,
        }


        if (likes) formattedMapReview.likes = likes;
        if (dislikes) formattedMapReview.dislikes = dislikes;
        if (otherComments) formattedMapReview.otherComments = otherComments;


        if (displayRatingBool) {
            const rawRating = await prisma.ratings.findUnique({
                where: {
                    mapID_submittedBy: {
                        mapID: mapID,
                        submittedBy: rawMapReview.reviews.review_collections.userID,
                    }
                },
                include: { difficulties: true },
            });


            if (rawRating) {
                const formattedRating = formatRating(rawRating);

                if (isErrorWithMessage(formattedRating)) throw formattedRating;

                formattedMapReview.rating = formattedRating;
            }
            else {
                formattedMapReview.displayRating = false;

                await prisma.reviews_maps.update({
                    where: { id: id },
                    data: { displayRatingBool: false },
                });
            }
        }


        return formattedMapReview;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const param_reviewCollectionID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.reviewCollectionID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("reviewCollectionID is not a number");
            return;
        }


        const exists = await prisma.review_collections.findUnique({
            where: { id: id },
            include: {
                reviews: {
                    include: {
                        review_collections: { select: { userID: true } },
                        reviews_maps: {
                            include: {
                                map_lengths: true,
                                reviews: { select: { review_collections: { select: { userID: true } } } },
                            },
                        },
                    },
                },
            },
        });

        if (!exists) {
            res.status(404).json("reviewCollectionID does not exist");
            return;
        }


        req.id = id;
        req.reviewCollection = exists;

        next();
    }
    catch (error) {
        next(error);
    }
}





export const param_reviewID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.reviewID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("reviewID is not a number");
            return;
        }


        const exists = await prisma.reviews.findUnique({
            where: { id: id },
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

        if (!exists) {
            res.status(404).json("reviewID does not exist");
            return;
        }


        req.id = id;
        req.review = exists;

        next();
    }
    catch (error) {
        next(error);
    }
}





export const param_mapReviewID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.mapReviewID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("mapReviewID is not a number");
            return;
        }


        const exists = await prisma.reviews_maps.findUnique({
            where: { id: id },
            include: {
                map_lengths: true,
                reviews: { select: { review_collections: { select: { userID: true } } } },
            },
        });

        if (!exists) {
            res.status(404).json("mapReviewID does not exist");
            return;
        }


        req.id = id;
        req.mapReview = exists;

        next();
    }
    catch (error) {
        next(error);
    }
}
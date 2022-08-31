import express from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { noRouteError, methodNotAllowed, errorHandler } from "../helperFunctions/errorHandling";
import { reviewPost } from "./reviews";
import { formatReviewCollection, formatReviewCollections, param_reviewCollectionID } from "../helperFunctions/reviewCollections-reviews-mapReviews";
import { adminPermsArray, checkPermissions, checkSessionAge, mapReviewersPermsArray, mapStaffPermsArray } from "../helperFunctions/sessions";
import { param_userID } from "../helperFunctions/users";

import { validateReviewCollectionPatch, validateReviewCollectionPost } from "../jsonSchemas/reviewCollections-reviews-mapReviews";



const router = express.Router();
export { router as reviewCollectionsRouter };




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawReviewCollections = await prisma.review_collections.findMany({
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


            const formattedReviewCollections = await formatReviewCollections(rawReviewCollections);


            res.status(200).json(formattedReviewCollections);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, mapReviewersPermsArray, true, res);
            if (!permission) return;


            const isAdmin = await checkPermissions(req, adminPermsArray, true);


            const userIdFromRequest: number | undefined = req.body.userID;
            const userIdFromSession = req.session.userID!;
            const userID: number = isAdmin ? (userIdFromRequest || userIdFromSession) : userIdFromSession;
            const name: string = req.body.name;
            const description: string = req.body.description;


            const valid = validateReviewCollectionPost({
                userID: userID,
                name: name,
                description: description,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawReviewCollection = await prisma.review_collections.create({
                data: {
                    userID: userID,
                    name: name,
                    description: description,
                },
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


            const formattedReviewCollection = await formatReviewCollection(rawReviewCollection);


            res.status(201).json(formattedReviewCollection);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const rawReviewCollections = await prisma.review_collections.findMany({
                where: { name: { startsWith: query } },
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


            const formattedReviewCollections = await formatReviewCollections(rawReviewCollections);


            res.status(200).json(formattedReviewCollections);
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


            const rawReviewCollections = await prisma.review_collections.findMany({
                where: { users: { displayName: { startsWith: query } } },
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


            const formattedReviewCollections = await formatReviewCollections(rawReviewCollections);


            res.status(200).json(formattedReviewCollections);
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


router.route("/users/:userID")
    .get(async function (req, res, next) {
        try {
            const userID = req.id2!;


            const rawReviewCollections = await prisma.review_collections.findMany({
                where: { userID: userID },
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


            const formattedReviewCollections = await formatReviewCollections(rawReviewCollections);


            res.status(200).json(formattedReviewCollections);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("reviewCollectionID", async function (req, res, next) {
    try {
        param_reviewCollectionID(req, res, next);
    }
    catch (error) {
        next(error);
    }
});


router.route("/:reviewCollectionID")
    .get(async function (req, res, next) {
        try {
            const rawReviewCollection = req.reviewCollection!;


            const formattedReviewCollection = await formatReviewCollection(rawReviewCollection);


            res.status(200).json(formattedReviewCollection);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const id = req.id!;
            const reviewCollectionFromID = req.reviewCollection!;
            const userIdFromReviewCollection = reviewCollectionFromID.userID;


            let permitted: boolean;

            if (req?.session?.userID === userIdFromReviewCollection) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            const isAdmin = await checkPermissions(req, adminPermsArray, true);


            const userID: number | undefined = isAdmin ? req.body.userID : undefined;
            const name: string | undefined = req.body.name;
            const description: string | undefined = req.body.description;


            const valid = validateReviewCollectionPatch({
                userID: userID,
                name: name,
                description: description,
            });

            if (!valid || (userID === undefined && name === undefined && description === undefined)) {
                res.status(400).json("Malformed request body");
                return;
            }


            const rawReviewCollection = await prisma.review_collections.update({
                where: { id: id },
                data: {
                    userID: userID,
                    name: name,
                    description: description,
                },
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


            const formattedReviewCollection = await formatReviewCollection(rawReviewCollection);


            res.status(200).json(formattedReviewCollection);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const id = req.id!;
            const reviewCollection = req.reviewCollection!;
            const userID = reviewCollection.userID;


            let permitted: boolean;

            if (req?.session?.userID === userID) {
                permitted = await checkSessionAge(req, res);
            }
            else {
                permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            }

            if (!permitted) return;


            await prisma.review_collections.delete({ where: { id: id } });


            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const permission = await checkPermissions(req, mapReviewersPermsArray, true, res);
            if (!permission) return;


            await reviewPost(req, res, next);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




    router.use(noRouteError);
    
    router.use(errorHandler);
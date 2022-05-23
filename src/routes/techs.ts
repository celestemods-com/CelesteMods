import express from "express";
import { prisma } from "../prismaClient";

import { isErrorWithMessage, toErrorWithMessage, noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mapStaffPermsArray, checkPermissions } from "../helperFunctions/sessions";

import { validatePost, validatePatch } from "../jsonSchemas/techs";

import { createTechData, createTechVideosData, rawTech, updateTechData } from "../types/internal";
import { formattedTech } from "../types/frontend";


const router = express.Router();




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const rawTechs = await prisma.tech_list.findMany({
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });

            const formattedTechs = rawTechs.map((rawTech) => {
                const formattedTech = formatTech(rawTech);
                if (isErrorWithMessage(formattedTech)) throw formattedTech;
                return formattedTech;
            });

            res.json(formattedTechs);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const name: string = req.body.name;                         //cant be undefined after validatePost
            const description: string | undefined = req.body.description === "" ? undefined : req.body.description;
            const techVideoUrlsArray: string[] | undefined = req.body.tutorialVideos;
            const difficulty: string | number = req.body.difficulty;    //cant be undefined after validatePost

            const valid = validatePost({
                name: name,
                description: description,
                tutorialVideos: techVideoUrlsArray,
                difficulty: difficulty,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const matchingTech = await prisma.tech_list.findFirst({
                where: { name: name },
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });

            if (matchingTech) {
                const formattedMatchingTech = formatTech(matchingTech);
                if (isErrorWithMessage(formattedMatchingTech)) throw formattedMatchingTech;

                res.status(200).json(formattedMatchingTech);
                return;
            }


            const createTechVideosArray: createTechVideosData[] = [];

            if (techVideoUrlsArray && techVideoUrlsArray.length) {
                techVideoUrlsArray.forEach((url) => {
                    createTechVideosArray.push({ url: url });
                });
            }


            const createData: createTechData = {
                name: name,
                description: description,
                techVideos: { create: createTechVideosArray },
                difficulties: {},
            };


            if (typeof (difficulty) === "string") {
                const matchingDifficulty = await prisma.difficulties.findFirst({
                    where: {
                        name: difficulty,
                        parentModID: null,
                        parentDifficultyID: null,
                    },
                });

                if (!matchingDifficulty) {
                    res.status(404).json("Difficulty name not found. Ensure that the specified difficulty is a default parent difficulty.");
                    return;
                }

                createData.difficulties = { connect: { id: matchingDifficulty.id } };
            }
            else if (typeof difficulty === "number") {
                const matchingDifficulty = await prisma.difficulties.findUnique({ where: { id: difficulty } });

                if (!matchingDifficulty) {
                    res.status(404).json("Difficulty id does not exist.");
                    return;
                }

                if (matchingDifficulty.parentModID !== null || matchingDifficulty.parentDifficultyID !== null) {
                    res.status(400).json("Invalid difficulty id. The specified difficulty must be a default parent difficulty.");
                    return;
                }

                createData.difficulties = { connect: { id: difficulty } };
            }
            else throw "Invalid 'difficulty'";


            const rawTech = await prisma.tech_list.create({
                data: createData,
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTech = formatTech(rawTech);
            if (isErrorWithMessage(formattedTech)) throw formattedTech;


            res.status(201).json(formattedTech);
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


            const rawTechs = await prisma.tech_list.findMany({
                where: { name: { startsWith: query } },
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTechs: formattedTech[] = rawTechs.map((rawTech) => {
                const formattedTech = formatTech(rawTech);
                if (isErrorWithMessage(formattedTech)) throw formattedTech;
                return formattedTech;
            });


            res.json(formattedTechs);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("modID", (async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.modID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("modID is not a number");
            return;
        }

        const exists = await prisma.mods_ids.findUnique({ where: { id: id } });
        if (!exists) {
            res.status(404).json("modID does not exist");
            return;
        }

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
}));


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const rawTechs = await prisma.tech_list.findMany({
                where: { maps_to_tech: { some: { maps_details: { maps_ids: { modID: req.id2 } } } } },
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTechs: formattedTech[] = rawTechs.map((rawTech) => {
                const formattedTech = formatTech(rawTech);
                if (isErrorWithMessage(formattedTech)) throw formattedTech;
                return formattedTech;
            });


            res.json(formattedTechs);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("mapID", (async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.mapID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("mapID is not a number");
            return;
        }

        const exists = await prisma.maps_ids.findUnique({ where: { id: id } });
        if (!exists) {
            res.status(404).json("mapID does not exist");
            return;
        }

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
}));


router.route("/map/:mapID")
    .get(async function (req, res, next) {
        try {
            const rawTechs = await prisma.tech_list.findMany({
                where: { maps_to_tech: { some: { mapDetailsID: req.id2 } } },
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTechs: formattedTech[] = rawTechs.map((rawTech) => {
                const formattedTech = formatTech(rawTech);
                if (isErrorWithMessage(formattedTech)) throw formattedTech;
                return formattedTech;
            });


            res.json(formattedTechs);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("difficultyID", (async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.difficultyID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("difficultyID is not a number");
            return;
        }

        const difficultyFromId = await prisma.difficulties.findUnique({ where: { id: id } });
        if (!difficultyFromId) {
            res.status(404).json("difficultyID does not exist");
            return;
        }

        if (difficultyFromId.parentModID === null && difficultyFromId.parentDifficultyID === null) req.valid = true;
        else req.valid = false;

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
}));


router.route("/difficulty/:difficultyID")
    .get(async function (req, res, next) {
        try {
            if (!req.valid) {
                res.status(400).json("Only default parent difficulties may be associated with tech");
                return;
            }


            const rawTechs = await prisma.tech_list.findMany({
                where: { difficulties: { id: req.id2 } },
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTechs: formattedTech[] = rawTechs.map((rawTech) => {
                const formattedTech = formatTech(rawTech);
                if (isErrorWithMessage(formattedTech)) throw formattedTech;
                return formattedTech;
            });


            res.json(formattedTechs);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("techID", (async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.techID;

        if (idRaw == "mod" || idRaw == "map" || idRaw == "difficulty") {
            res.status(400).json(`Must specify ${idRaw}ID`);
            return;
        }

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("techID is not a number");
            return;
        }

        const techFromID = await prisma.tech_list.findUnique({
            where: { id: id },
            include: {
                difficulties: true,
                tech_videos: true,
            },
        });

        if (!techFromID) {
            res.status(404).json("techID does not exist");
            return;
        }

        req.tech = techFromID
        req.id = id;
        next();
    }
    catch (error) {
        next(error);
    }
}));


router.route("/:techID")
    .get(async function (req, res, next) {
        try {
            const rawTech = <rawTech>req.tech;  //cant be undefined because the router.param already checked that the tech exists


            const formattedTech = formatTech(rawTech);
            if (isErrorWithMessage(formattedTech)) throw formattedTech;


            res.json(formattedTech);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const id = <number>req.id;  //cant be undefined because the router.param already checked that the id is valid
            const name: string | undefined = req.body.name;
            const description: string | null | undefined = req.body.description === "" ? null : req.body.description;
            const techVideoUrlsArray: string[] | undefined = req.body.tutorialVideos;
            const difficulty: string | number | undefined = req.body.difficulty;

            const valid = validatePatch({
                name: name,
                description: description,
                difficulty: difficulty,
            });

            if (!valid || (!name && description === undefined && !techVideoUrlsArray && !difficulty)) {
                res.status(400).json("Malformed request body");
                return;
            }


            if (name) {
                const matchingTech = await prisma.tech_list.findFirst({
                    where: {
                        NOT: { id: id },
                        name: name,
                    },
                    include: {
                        difficulties: true,
                        tech_videos: true,
                    },
                });

                if (matchingTech) {
                    const formattedMatchingTech = formatTech(matchingTech);
                    if (isErrorWithMessage(formattedMatchingTech)) throw formattedMatchingTech;

                    res.status(400).json(["Tech already exists", formattedMatchingTech]);
                    return;
                }
            }


            const createTechVideosArray: createTechVideosData[] = [];

            if (techVideoUrlsArray && techVideoUrlsArray.length) {
                techVideoUrlsArray.forEach((url) => {
                    createTechVideosArray.push({ url: url });
                });
            }


            const updateData: updateTechData = {
                name: name,
                description: description,
                techVideos: { connectOrCreate: createTechVideosArray },
            };


            if (difficulty !== undefined) {
                if (typeof (difficulty) === "string") {
                    const matchingDifficulty = await prisma.difficulties.findFirst({
                        where: {
                            name: difficulty,
                            parentModID: null,
                            parentDifficultyID: null,
                        },
                    });

                    if (!matchingDifficulty) {
                        res.status(404).json("Difficulty name not found. Ensure that the specified difficulty is a default parent difficulty.");
                        return;
                    }

                    updateData.difficulties = { connect: { id: matchingDifficulty.id } };
                }
                else if (typeof difficulty === "number") {
                    const matchingDifficulty = await prisma.difficulties.findUnique({ where: { id: difficulty } });

                    if (!matchingDifficulty) {
                        res.status(404).json("Difficulty id does not exist.");
                        return;
                    }

                    if (matchingDifficulty.parentModID !== null || matchingDifficulty.parentDifficultyID !== null) {
                        res.status(400).json("Invalid difficulty id. The specified difficulty must be a default parent difficulty.");
                        return;
                    }

                    updateData.difficulties = { connect: { id: difficulty } };
                }
                else throw "Invalid 'difficulty'";
            }


            const rawTech = await prisma.tech_list.update({
                where: { id: id },
                data: updateData,
                include: {
                    difficulties: true,
                    tech_videos: true,
                },
            });


            const formattedTech = formatTech(rawTech);
            if (isErrorWithMessage(formattedTech)) throw formattedTech;


            res.json(formattedTech);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            await prisma.tech_list.delete({ where: { id: req.id } });

            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




const formatTech = function (rawTech: rawTech) {
    try {
        const id = rawTech.id;
        const name = rawTech.name;
        const description = rawTech.description === null ? undefined : rawTech.description;
        const techVideoObjectsArray = rawTech.techVideos === null ? undefined : rawTech.techVideos;
        const difficulty = rawTech.difficulties;


        let videoUrlsArray;

        if (techVideoObjectsArray && techVideoObjectsArray.length) {
            const techVideoUrlsArray: string[] = [];

            techVideoObjectsArray.forEach((techVideo) => {
                techVideoUrlsArray.push(techVideo.url);
            });

            videoUrlsArray = techVideoUrlsArray;
        }


        const formattedTech: formattedTech = {
            id: id,
            name: name,
            description: description,
            videos: videoUrlsArray,
            difficulty: difficulty,
        };


        return formattedTech;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




router.use(noRouteError);

router.use(errorHandler);


export { router as techsRouter, formatTech };
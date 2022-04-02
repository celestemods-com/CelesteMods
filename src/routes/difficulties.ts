import express from "express";
import { prisma } from "../prismaClient";
import { validatePost, validatePatch } from "../jsonSchemas/difficulties";
import { noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { difficulties } from ".prisma/client";
import { createDifficultyData } from "../types/internal";


const router = express.Router();




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const difficulties = await prisma.difficulties.findMany();

            res.json(difficulties);
        }
        catch (error) {
            next(error)
        }
    })
    .post(async function (req, res, next) {
        try {
            const name: string = req.body.name;         //can't be null after validatePost call
            const description: string | null = req.body.description;
            const parentModID: number | null = req.body.parentModID === 0 ? null : req.body.parentModID;
            const parentDifficultyID: number | null = req.body.parentDifficultyID === 0 ? null : req.body.parentDifficultyID;
            const order: number = req.body.order;       //can't be null after validatePost call

            const valid = validatePost({
                name: name,
                description: description,
                parentDifficultyID: parentDifficultyID,
                parentModID: parentModID,
                order: order,
            });

            if (!valid) {
                res.status(400).json("Malformed request body");
                return;
            }


            const matchingDifficulty = await validateDifficulty(<number>req.id, parentModID, parentDifficultyID, order);    //can cast as number because the router.param already checked that the id is valid

            if (typeof (matchingDifficulty) === "string") {
                res.status(404).json(matchingDifficulty);
                return;
            }

            if (matchingDifficulty) {
                res.status(200).json(matchingDifficulty);
                return;
            }


            const createData: createDifficultyData = {
                name: name,
                description: description,
                parentModID: parentModID,
                parentDifficultyID: parentDifficultyID,
                order: order,
            }


            const difficulty = await prisma.difficulties.create({ data: createData });


            res.status(201).json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);




router.route("/default")
    .get(async function (_req, res, next) {
        try {
            const difficulties = await prisma.difficulties.findMany({ where: { parentModID: null } });

            res.json(difficulties);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);


router.route("/default/parent")
    .get(async function (_req, res, next) {
        try {
            const difficulties = await prisma.difficulties.findMany({
                where: {
                    parentModID: null,
                    parentDifficultyID: null,
                },
            });

            res.json(difficulties);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);


router.route("/default/sub")
    .get(async function (_req, res, next) {
        try {
            const difficulties = await prisma.difficulties.findMany({
                where: {
                    parentModID: null,
                    NOT: { parentDifficultyID: null },
                },
            });

            res.json(difficulties);
        }
        catch (error) {
            next(error)
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


            const difficulty = await prisma.difficulties.findMany({ where: { name: { startsWith: query } } });


            res.json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);


router.route("/search/mod")
    .get(async function (req, res, next) {
        try {
            const query = req.query.name;

            if (typeof (query) != "string") {
                res.sendStatus(400);
                return;
            }


            const difficulty = await prisma.difficulties.findMany({ where: { mods_ids: { mods_details: { some: { name: { startsWith: query } } } } } });


            res.json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);




router.param("modID", async function (req, res, next) {
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
        next(error)
    }
});


router.route("/mod/:modID")
    .get(async function (req, res, next) {
        try {
            const difficulty = await prisma.difficulties.findMany({ where: { parentModID: req.id2 } });


            res.json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);




router.param("diffID", async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.diffID;

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


        req.difficulty = difficultyFromId;
        req.id = id;
        next();
    }
    catch (error) {
        next(error)
    }
});


router.route("/:diffID")
    .get(async function (req, res, next) {
        try {
            const difficulty = req.difficulty;

            res.status(200).json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .patch(async function (req, res, next) {
        try {
            const difficultyFromId = <difficulties>req.difficulty;   //can cast as 'difficulties' because the router.param already checked that the id is valid

            const id: number = difficultyFromId.id;
            const name: string | undefined = req.body.name;
            const description: string | undefined = req.body.description;
            const parentModID: number | null = req.body.parentModID === undefined ? difficultyFromId.parentModID : (req.body.parentModID === 0 ? null : req.body.parentModID);
            const parentDifficultyID: number | null = req.body.parentDifficultyID === undefined ? difficultyFromId.parentDifficultyID : (req.body.parentDifficultyID === 0 ? null : req.body.parentDifficultyID);
            const order: number | undefined = req.body.order === null ? undefined : req.body.order;

            const valid = validatePatch({
                name: name,
                description: description,
                parentModID: parentModID,
                parentDifficultyID: parentDifficultyID,
                order: order,
            });

            if (!valid || (!name && !description && req.body.parentModId === undefined && req.body.parentDifficultyID === undefined && !order)) {
                res.status(400).json("Malformed request body");
                return;
            }


            const matchingDifficulty = await validateDifficulty(id, parentModID, parentDifficultyID, order);

            if (typeof (matchingDifficulty) === "string") {
                res.status(404).json(matchingDifficulty);
                return;
            }

            if (matchingDifficulty) {
                res.status(400).json(["difficulty already exists", matchingDifficulty]);
                return;
            }


            const difficulty = await prisma.difficulties.update({
                where: { id: id },
                data: {
                    name: name,
                    description: description,
                    parentModID: parentModID,
                    parentDifficultyID: parentDifficultyID,
                    order: order,
                },
            });

            res.status(200).json(difficulty);
        }
        catch (error) {
            next(error)
        }
    })
    .delete(async function (req, res, next) {
        try {
            const difficultyFromId = <difficulties>req.difficulty;

            if (difficultyFromId.parentDifficultyID === null) {
                const subDifficulty = await prisma.difficulties.findFirst({ where: { parentDifficultyID: difficultyFromId.id } });

                if (subDifficulty) {
                    res.status(400).json("Parent difficulties may not be deleted. Delete all sub-difficulties first.");
                    return;
                }
            }


            await prisma.difficulties.delete({ where: { id: req.id } });

            res.sendStatus(204);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);




router.route("/:diffID/sub")
    .get(async function (req, res, next) {
        try {
            const difficultyFromId = <difficulties>req.difficulty;  //can cast as 'difficulties' because the router.param already checked that the id is valid

            if (difficultyFromId.parentDifficultyID) {
                res.status(400).json("Sub-difficulties cannot have their own sub-difficulties");
                return;
            }

            const difficulties = await prisma.difficulties.findMany({ where: { parentDifficultyID: req.id } });


            res.json(difficulties);
        }
        catch (error) {
            next(error)
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);




const validateDifficulty = async function (id: number, parentModId: number | null, parentDifficultyId: number | null, order: number | undefined): Promise<difficulties | string | null> {
    if (parentModId) {
        const modFromId = await prisma.mods_ids.findUnique({ where: { id: parentModId } });

        if (!modFromId) return "parentMod not found";
    }


    if (parentDifficultyId) {
        const parentDifficulty = await prisma.difficulties.findUnique({ where: { id: parentDifficultyId } });

        if (!parentDifficulty) return "parentDifficulty not found";

        if (parentDifficulty.parentDifficultyID != null) return "Sub-difficulties may not have their own subdifficulties";
    }


    const whereObject = {
        NOT: { id: id },
        parentModID: parentModId,
        parentDifficultyID: parentDifficultyId,
        order: order,
    }

    const matchingDifficulty = await prisma.difficulties.findFirst({ where: whereObject });

    return matchingDifficulty;
}


export { router as difficultiesRouter };
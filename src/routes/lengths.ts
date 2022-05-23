import express from "express";
import { prisma } from "../prismaClient";

import { noRouteError, errorHandler, methodNotAllowed } from "../errorHandling";
import { mapStaffPermsArray, checkPermissions } from "../helperFunctions/sessions";

import { validatePost, validatePatch } from "../jsonSchemas/lengths";

import { map_lengths } from "@prisma/client";


const router = express.Router();

type length = map_lengths | null;




router.use(function (req, _res, next) {
    const length: reqLength = {
        name: req.body.name,
        description: req.body.description,
        order: req.body.order,
    };

    req.length = length;

    next();
});




router.route("/")
    .get(async function (_req, res, next) {
        try {
            const lengths: length[] = await prisma.map_lengths.findMany();
            res.json(lengths);
        }
        catch (error) {
            next(error);
        }
    })
    .post(async function (req, res, next) {
        const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
        if (!permitted) return;


        const newLength = <map_lengths>req.length;  //none of the parameters can be undefined or null after validatePost
        const valid = validatePost(newLength);

        if (!valid) {
            res.status(400).json("Malformed request body");
            return;
        }

        try {
            const matchingLength = await prisma.map_lengths.findFirst({
                where: {
                    OR: [
                        { name: newLength.name },
                        { description: newLength.description },
                        { order: newLength.order },
                    ],
                },
            });

            if (matchingLength) {
                res.status(200).json(matchingLength);
                return;
            }

            const length: length = await prisma.map_lengths.create({ data: newLength });

            res.status(201).json(length);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.route("/search")
    .get(async function (req, res, next) {
        const query = req.query.name;

        if (typeof (query) != "string") {
            res.sendStatus(400);
            return;
        }

        try {
            const length = await prisma.map_lengths.findMany({
                where: { name: { startsWith: query } }
            });
            res.json(length);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.param("id", function (req, res, next) {
    const idRaw: unknown = req.params.id;

    const id: number = Number(idRaw);
    if (isNaN(id)) {
        res.sendStatus(400);
        return;
    }
    req.id = id;
    next();
});


router.route("/:id")
    .get(async function (req, res, next) {
        try {
            const length: length = await prisma.map_lengths.findUnique({ where: { id: req.id } });
            res.json(length);
        }
        catch (error) {
            next(error);
        }
    })
    .patch(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            const reqLength = req.length;
            const valid = validatePatch(reqLength);

            if (!reqLength) throw "reqLength is undefined or null";

            if (!valid || (!reqLength.name && !reqLength.description && !reqLength.order)) {
                res.status(400).json("Malformed request body");
                return;
            }


            let matchingLength;

            if (reqLength.name) {
                matchingLength = await prisma.map_lengths.findFirst({
                    where: {
                        NOT: { id: req.id },
                        name: reqLength.name,
                    },
                });
            }

            if (reqLength.order && !matchingLength) {
                matchingLength = await prisma.map_lengths.findFirst({
                    where: {
                        NOT: { id: req.id },
                        order: reqLength.order,
                    },
                });
            }

            if (matchingLength) {
                res.status(400).json(["Length already exists", matchingLength]);
                return;
            }


            const length = await prisma.map_lengths.update({
                where: { id: req.id },
                data: {
                    name: reqLength?.name,
                    description: reqLength?.description,
                    order: reqLength?.order
                },
            });


            res.status(200).json(length);
        }
        catch (error) {
            next(error);
        }
    })
    .delete(async function (req, res, next) {
        try {
            const permitted = await checkPermissions(req, mapStaffPermsArray, true, res);
            if (!permitted) return;


            await prisma.map_lengths.delete({
                where: { id: req.id }
            });
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    })
    .all(methodNotAllowed);




router.use(noRouteError);

router.use(errorHandler);

export { router as lengthsRouter };
import express from "express";
import ajvModule from "ajv";
import { prisma } from "../prismaClient";
import { noRouteError, errorHandler } from "../errorHandling";
import { expressRouteTypes } from "../types/express"    //leaving this here keeps ts-node happy for some reason. tsc doesnt care
import { map_lengths } from "@prisma/client";


const router = express.Router();
const ajv = new ajvModule();


type length = map_lengths | null;
const postSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        order: { type: "integer" },
    },
    additionalProperties: false,
    required: ["name", "description", "order"],
};
const patchSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
            maxLength: 20,
        },
        description: {
            type: "string",
            minLength: 1,
            maxLength: 100,
        },
        order: { type: "integer" },
    },
    additionalProperties: false,
};

const validatePost = ajv.compile(postSchema);
const validatePatch = ajv.compile(patchSchema);




router.use(function (req, _res, next) {
    const name: string = req.body.name;
    const description: string = req.body.description;
    const order: number = req.body.order;

    const length: reqLength = {
        name: name != null ? name : undefined,
        description: description != null ? description : undefined,
        order: order != null ? order : undefined,
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
        const newLength = req.length as map_lengths;
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
    });




router.route("/search")
    .get(async function (req, res, next) {
        const query: string = <string> req.query.name;
    
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
    .all(function (_req, res, next) {
        try{
            res.sendStatus(405);
        }
        catch (error) {
            next(error);
        }
    });




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
        const reqLength = req.length;
        const valid = validatePatch(reqLength);

        if (!valid) {
            res.status(400).json("Malformed request body");
            return;
        }

        try {
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
            await prisma.map_lengths.delete({
                where: { id: req.id }
            });
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    });




router.use(noRouteError);

router.use(errorHandler);

export { router as lengthsRouter };
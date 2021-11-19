import { map_lengths } from "@prisma/client";
import express from "express";
import { expressRouteTypes } from "../types/express";
import ajvModule from "ajv";
import {prisma} from "../prismaClient";


const router = express.Router();
const ajv = new ajvModule();


type length = map_lengths | null;
const patchSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        description: {type: "string"},
        order: {type: "integer"},
    },
    additionalProperties: false,
};
const postSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        description: {type: "string"},
        order: {type: "integer"},
    },
    additionalProperties: false,
    required: ["name", "description", "order"]
};

const validatePatch = ajv.compile(patchSchema);
const validatePost = ajv.compile(postSchema);




router.use(<expressRouteTypes> function (req, _res, next) {
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
    .get(<expressRouteTypes> async function (_req, res) {
        const lengths: length[] = await prisma.map_lengths.findMany();
        res.json(lengths);
    })
    .post(<expressRouteTypes> async function (req, res) {
        const newLength = req.length as map_lengths;
        const valid = validatePost(newLength);

        if(!valid){
            res.sendStatus(400);
            return;
        }

        const matchingLength = await prisma.map_lengths.findFirst({
            where: {
                OR: [
                    {
                        name: newLength.name,
                    },
                    {
                        description: newLength.description,
                    },
                    {
                        order: newLength.order,
                    },
                ]
            },
        });

        console.log(matchingLength)

        if(matchingLength) {
            res.status(200).json(matchingLength);
            return;
        }

        const length: length = await prisma.map_lengths.create({
            data: newLength,
        });
        
        res.status(201).json(length);
    });




router.param("id", <expressRouteTypes> function(req, res, next){
    const idRaw: unknown = req.params.id;

    if(idRaw === "search") {
        return searchFunction(req, res, next);
    }

    const id: number = Number(idRaw);
    if(isNaN(id)) {
        res.sendStatus(400);
        return;
    }
    req.id = id;
    next();
});

router.route("/:id")
    .get(<expressRouteTypes> async function (req, res) {
        const length: length = await prisma.map_lengths.findUnique({
            where: {
                id: req.id,
            },
        });

        res.json(length);
    })
    .patch(<expressRouteTypes> async function (req, res) {
        const reqLength = req.length;
        const valid = validatePatch(reqLength);

        if(!valid) {
            res.sendStatus(400);
            return;
        }

        const length = await prisma.map_lengths.update({
            where: {
                id: req.id,
            },
            data: {
                name: reqLength?.name,
                description: reqLength?.description,
                order: reqLength?.order
            },
        });
        res.status(200).json(length);
    })
    .delete(<expressRouteTypes> async function (req, res) {
        await prisma.map_lengths.delete({
            where: {
                id: req.id,
            },
        });

        res.sendStatus(204);
    });




const searchFunction = <expressRouteTypes> async function(req, res) {
    const query: string = <string> req.query.name;

    if(typeof(query) != "string"){
        res.sendStatus(400);
        return;
    }

    const length: length[] = await prisma.map_lengths.findMany({
        where: {
            name: {
                startsWith: query,
            },
        },
    });

    res.json(length);
}

export {router as lengthsRouter};
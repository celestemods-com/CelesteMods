import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
import express from "express";
const router = express.Router();


router.route("/")
    .get(async (_req: any, res: any) => {
        const lengths = await prisma.map_lengths.findMany();
        res.json(lengths);
    })
    .post(async (req: any, res: any) => {
        const length = await prisma.map_lengths.create({ data: req.body });
        res.json(length);
    })

router.route("/:id")
    .get(async(req: any, res: any) => {
    const lengthID: number = Number(req.params.id);
    const length = await prisma.map_lengths.findUnique({
        where: {
            id: lengthID,
        },
    });
    res.json(length);
})

export {router as lengthsRouter};
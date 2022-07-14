import { prisma } from "../middlewaresAndConfigs/prismaClient";
import { expressRoute } from "../types/express";





export const param_lengthID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.lengthID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("lengthID is not a number");
            return;
        }

        const exists = await prisma.map_lengths.findUnique({ where: { id: id } });

        if (!exists) {
            res.status(404).json("lengthID does not exist");
            return;
        }

        req.id2 = id;
        next();
    }
    catch (error) {
        next(error);
    }
}


export const param_lengthOrder = <expressRoute>async function (req, res, next) {
    try {
        const orderRaw: unknown = req.params.lengthOrder;

        const order = Number(orderRaw);

        if (isNaN(order)) {
            res.status(400).json("lengthOrder is not a number");
            return;
        }

        const lengthFromId = await prisma.map_lengths.findUnique({ where: { order: order } });

        if (!lengthFromId) {
            res.status(404).json("lengthOrder does not exist");
            return;
        }

        req.id2 = lengthFromId.id;
        next();
    }
    catch (error) {
        next(error);
    }
}
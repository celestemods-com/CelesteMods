import { NextFunction, Request, Response } from "express";

export const enforceSSL = function (req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.headers["forwarded"] || !req.headers["forwarded"].includes("proto=https")) {
            res.status(403).json("HTTPS Required");
            return;
        }

        next();
    }
    catch (error) {
        next(error);
    }
}
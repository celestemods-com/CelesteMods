import { Request, Response, NextFunction } from "express";


const maxAge = "1";

const openMethods = "GET,PATCH";

const closedOrigin = "https://celestemods.com";
const closedMethods = "GET,POST,PATCH,PUT,DELETE";




const openCors = function (req: Request, res: Response, next: NextFunction) {
    try {
        let oneof = false;
        if (req.headers.origin) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);
            oneof = true;
        }
        if (req.headers["access-control-request-method"]) {
            res.header("Access-Control-Allow-Methods", req.headers["access-control-request-method"]);
            oneof = true;
        }
        if (req.headers["access-control-request-headers"]) {
            res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
            oneof = true;
        }

        if (oneof) {
            res.header("Access-Control-Max-Age", maxAge );
        }

        // intercept OPTIONS method
        if (oneof && req.method == "OPTIONS") {
            res.sendStatus(200);
        }
        else {
            //req.openCors = true;
            next();
        }
    }
    catch (error) {
        next(error);
    }
};




const closedCors = function (req: Request, res: Response, next: NextFunction) {
    try {   //@ts-ignore
        if (req.openCors) {
            next();
            return;
        }

        let oneof = false;
        if (req.headers.origin) {
            res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === "dev" ? req.headers.origin : closedOrigin);
            oneof = true;
        }
        if (req.headers["access-control-request-method"]) {
            res.header("Access-Control-Allow-Methods", closedMethods);
            oneof = true;
        }
        if (req.headers["access-control-request-headers"]) {
            res.header("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
            oneof = true;
        }

        if (oneof) {
            res.header("Access-Control-Max-Age", maxAge );
        }

        // intercept OPTIONS method
        if (oneof && req.method == "OPTIONS") {
            res.sendStatus(200);
        }
        else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
};


export { openCors, closedCors };
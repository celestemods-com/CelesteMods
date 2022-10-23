import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import express from "express";
import { noRouteError, errorHandler } from "./helperFunctions/errorHandling";


export const app = express();





const port = process.env.PORT || "3005";
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);


app.use(express.json({ limit: '1mb' }));



import { handleImportRouter } from "./handleDbImport";

app.use("/db-import", handleImportRouter);


app.use(noRouteError);

app.use(errorHandler);
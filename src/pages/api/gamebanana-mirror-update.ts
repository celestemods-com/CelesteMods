import type { NextApiRequest, NextApiResponse } from "next";
import { isStringArray } from "~/utils/typeGuards";




type Key = string;

const CATEGORY_INFO_KEYS = [
    "newFiles",
    "deletedFiles"
] as const satisfies Key[];

const FILE_CATEGORIES = [
    "modFiles",
    "modImages",
    "richPresenceIcons"
] as const satisfies Key[];




type FileName = string;


type CategoryUpdateKeys = typeof CATEGORY_INFO_KEYS[number];

type CategoryUpdate = {
    [Key in CategoryUpdateKeys]: FileName[];
};


type FileCategory = typeof FILE_CATEGORIES[number];

type Update = {
    [Key in FileCategory]: CategoryUpdate;
};




/** This function returns HTTP status codes.
 * 200: If the request is authenticated and the update is valid,
 * 401 or 403: If the request is not authenticated.
*/
const isAuthenticated = (req: NextApiRequest): number => {

};




const isValidCategoryUpdate = (value: unknown): value is CategoryUpdate => {
    if (typeof value !== "object" || value === null) {
        return false;
    }


    const categoryUpdate = value as Record<Key, unknown>;


    for (const key of CATEGORY_INFO_KEYS) {
        const categoryUpdateArray = categoryUpdate[key];

        if (!isStringArray(categoryUpdateArray)) {
            return false;
        }
    }


    return true;
};


const isValidUpdate = (value: unknown): value is Update => {
    if (typeof value !== "object" || value === null) {
        return false;
    }


    const update = value as Record<Key, unknown>;


    for (const categoryName of FILE_CATEGORIES) {
        const categoryUpdate = update[categoryName];

        if (!isValidCategoryUpdate(categoryUpdate)) {
            return false;
        }
    }


    return true;
};




const updateStorageBucket = async (categoryName: FileCategory, categoryUpdate: CategoryUpdate): Promise<void> => {
    //TODO!!! Implement this function
    // 
};




const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const statusCode = isAuthenticated(req);

    if (statusCode !== 200) {
        res.status(statusCode).end();
        return;
    }


    const update = JSON.parse(req.body);

    if (!isValidUpdate(update)) {
        res.status(400).end();
        return;
    }


    res.status(202).end();


    // Update the storage buckets
};

export default handler;
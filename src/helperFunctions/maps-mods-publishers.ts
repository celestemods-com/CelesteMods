import { Request, Response } from "express";
import { prisma } from "../middlewaresAndConfigs/prismaClient";
import axios from "axios";

import { isErrorWithMessage, toErrorWithMessage } from "./errorHandling";
import { difficulties, map_lengths, mods_details_type, publishers, users } from ".prisma/client";
import { checkPermissions, mapStaffPermsArray } from "./sessions";
import { getLengthID, lengthErrorMessage } from "./lengths";

import { maxParentDifficultiesPerMod } from "../jsonSchemas/maps-mods-publishers";

import {
    rawMod, rawMap, createParentDifficultyForMod, createChildDifficultyForMod, jsonCreateMapWithMod, mapIdCreationObjectForMod,
    mapToTechCreationObject, defaultDifficultyForMod, publisherConnectionObject, publisherCreationObject, rawPublisher
} from "../types/internal";
import { formattedMod, formattedMap, formattedPublisher } from "../types/frontend";
import { expressRoute } from "../types/express";




const canonicalDifficultyNameErrorMessage = "canonicalDifficulty does not match any default parent difficulty names";
const techNameErrorMessage = "A tech name in techAny did not match the names of any tech in the celestemods.com database";
const gamebananaApiError = "GameBanana api not responding as expected.";
export const invalidMapperUserIdErrorMessage = "No user found with ID = ";
export const invalidMapDifficultyErrorMessage = `All maps in a non-Normal mod must be assigned a modDifficulty that matches the difficulties used by the mod (whether default or custom).
If the mod uses sub-difficulties, modDifficulty must be given in the form [difficulty, sub-difficulty].`;
export const noModDetailsErrorMessage = "The specified modID exists, but no revisions have been approved by staff. Use GET /mods/{mod.id}/revisions"
export const noMapDetailsErrorMessage = "The specified mapID exists, but no revisions have been approved by staff. Use GET /maps/{map.id}/revisions"




export const getPublisherCreateOrConnectObject = async function (res: Response, userID?: number, publisherGamebananaID?: number,
    publisherID?: number, publisherName?: string) {
    try {
        let publisherCreateOrConnectObject: publisherConnectionObject | publisherCreationObject | undefined = undefined;

        if (userID) {
            const userFromID = await prisma.users.findUnique({
                where: { id: userID },
                include: { publishers: true },
            });

            if (!userFromID) {
                res.status(404).json("userID not found");
                res.errorSent = true;
                return;
            }

            if (userFromID.publishers.length < 1) {
                res.status(400).json("Specified user has no associated publishers.");
                res.errorSent = true;
                return;
            }

            if (userFromID.publishers.length > 1) {
                const publisherIDArray = userFromID.publishers.map((publisher) => {
                    return publisher.id;
                });

                res.status(400).json(`Specified user has more than 1 associated publisher. Please specify publisherID instead.
                Publisher IDs associated with the specified user are: ${publisherIDArray}`);
                res.errorSent = true;
                return;
            }

            publisherCreateOrConnectObject = { connect: { id: userFromID.publishers[0].id } };
            publisherName = userFromID.publishers[0].name;
        }
        else if (publisherGamebananaID) {
            const publisherFromGbID = await prisma.publishers.findUnique({ where: { gamebananaID: publisherGamebananaID } });

            if (publisherFromGbID) {
                publisherCreateOrConnectObject = { connect: { gamebananaID: publisherGamebananaID } };
            }
            else {
                const nameFromGamebanana = await getGamebananaUsernameById(publisherGamebananaID);

                if (isErrorWithMessage(nameFromGamebanana)) throw nameFromGamebanana;

                if (nameFromGamebanana == "false") {
                    res.status(404).json("Specified Member ID does not exist on GameBanana.");
                    res.errorSent = true;
                    return;
                }

                publisherCreateOrConnectObject = {
                    create: {
                        name: nameFromGamebanana,
                        gamebananaID: publisherGamebananaID,
                    },
                };
                publisherName = nameFromGamebanana;
            }
        }
        else if (publisherID) {
            const publisherFromID = await prisma.publishers.findUnique({ where: { id: publisherID } });

            if (!publisherFromID) {
                res.status(404).json("publisherID not found.");
                res.errorSent = true;
                return;
            }

            publisherCreateOrConnectObject = { connect: { id: publisherID } };
            publisherName = publisherFromID.name;
        }
        else if (publisherName) {
            const publishersFromName = await prisma.publishers.findMany({ where: { name: publisherName } });

            if (publishersFromName.length > 1) {
                const publisherIDArray: number[] = []
                publishersFromName.map((publisher) => {
                    return publisher.id;
                });

                res.status(400).json(`More than one publisher has the specified name. Please specify publisherID instead.
                Publisher IDs with the specified name are: ${publisherIDArray}`);
                res.errorSent = true;
                return;
            }

            if (publishersFromName.length === 1) {
                publisherCreateOrConnectObject = { connect: { id: publishersFromName[0].id } };
            }
            else {
                const gamebananaID = await getGamebananaIdByUsername(publisherName);

                if (isErrorWithMessage(gamebananaID)) throw gamebananaID;

                if (gamebananaID === -1) {
                    res.status(404).json("Specified username does not exist on GameBanana.");
                    res.errorSent = true;
                    return;
                }

                publisherCreateOrConnectObject = {
                    create: {
                        name: publisherName,
                        gamebananaID: gamebananaID,
                    },
                };
            }
        }

        if (publisherCreateOrConnectObject && publisherName) {
            return [publisherCreateOrConnectObject, publisherName];
        }
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
};




export const getDifficultyArrays = function (res: Response, difficultyNames: (string | string[])[], highestCurrentDifficultyID: number) {
    try {
        let difficultyNamesArray: { name: string }[] = [];
        let difficultiesDataArray: createParentDifficultyForMod[] = [];
        let modHasSubDifficultiesBool = false;
        let modDifficultyIDsArray: number[] = [];


        for (let parentDifficultyIndex = 0; parentDifficultyIndex < difficultyNames.length; parentDifficultyIndex++) {
            const parentDifficultyStringOrArray = difficultyNames[parentDifficultyIndex];


            if (typeof parentDifficultyStringOrArray === "string") {
                highestCurrentDifficultyID++;

                modDifficultyIDsArray.push(highestCurrentDifficultyID);

                difficultiesDataArray.push({
                    id: highestCurrentDifficultyID,
                    name: parentDifficultyStringOrArray,
                    order: parentDifficultyIndex + 1,
                });

                difficultyNamesArray.push({ name: parentDifficultyStringOrArray });

                continue;
            }


            modHasSubDifficultiesBool = true;
            const childDifficultyArray: createChildDifficultyForMod[] = [];

            const parentDifficultyArrayLength = parentDifficultyStringOrArray.length;
            if (parentDifficultyArrayLength > maxParentDifficultiesPerMod) {
                res.status(400).json(`The maximum allowed number of parent difficulties in a single mod is ${maxParentDifficultiesPerMod}.`);
                res.errorSent = true;
                return;
            }

            for (let childDifficultyIndex = 1; childDifficultyIndex < parentDifficultyArrayLength; childDifficultyIndex++) {
                const childDifficultyName = parentDifficultyStringOrArray[childDifficultyIndex];
                highestCurrentDifficultyID++;

                modDifficultyIDsArray.push(highestCurrentDifficultyID);

                childDifficultyArray.push({
                    id: highestCurrentDifficultyID,
                    name: childDifficultyName,
                    order: childDifficultyIndex,
                });

                difficultyNamesArray.push({ name: childDifficultyName });
            }

            highestCurrentDifficultyID++;

            modDifficultyIDsArray.push(highestCurrentDifficultyID);

            difficultiesDataArray.push({
                id: highestCurrentDifficultyID,
                name: parentDifficultyStringOrArray[0],
                order: parentDifficultyIndex + 1,
                other_difficulties: { create: childDifficultyArray },
            });

            difficultyNamesArray.push({ name: parentDifficultyStringOrArray[0] });
        }


        const returnArray: ({ name: string }[] | createParentDifficultyForMod[] | boolean | number[])[]
            = [difficultyNamesArray, difficultiesDataArray, modHasSubDifficultiesBool, modDifficultyIDsArray];

        return returnArray;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const formatMod = async function (rawMod: rawMod) {
    try {
        const id = rawMod.id;
        const rawMaps = rawMod.maps_ids;


        if (rawMod.mods_details.length < 1) return `For mod ${id}: ` + noModDetailsErrorMessage;


        const outerFormattedMaps = await Promise.all(
            rawMaps.map(
                async (rawMap) => {
                    const formattedMap = await formatMap(rawMap, rawMod);

                    if (isErrorWithMessage(formattedMap)) throw formattedMap;

                    if (formattedMap === noMapDetailsErrorMessage) return `For map ${rawMap.id}: ` + noMapDetailsErrorMessage;

                    return formattedMap;
                }));


        let formattedDifficultiesArray: (string | string[])[];

        if (rawMod.difficulties) {
            formattedDifficultiesArray = getSortedDifficultyNames(rawMod.difficulties, id);
        }


        const outerFormattedMod = rawMod.mods_details.map((modDetails) => {
            const revision = modDetails.revision;
            const innerType = modDetails.type;
            const name = modDetails.name;
            const publisherID = modDetails.publisherID;
            const publisherGamebananaID = modDetails.publishers.gamebananaID === null ? undefined : modDetails.publishers.gamebananaID;
            const contentWarning = modDetails.contentWarning;
            const notes = modDetails.notes === null ? undefined : modDetails.notes;
            const shortDescription = modDetails.shortDescription;
            const longDescription = modDetails.longDescription === null ? undefined : modDetails.longDescription;
            const gamebananaModID = modDetails.gamebananaModID === null ? undefined : modDetails.gamebananaModID;
            const approvedBool = modDetails.timeApproved === null ? false : true;


            const innerFormattedMaps: (string | formattedMap[])[] = [];

            outerFormattedMaps.forEach((formattedMap) => {
                if (typeof formattedMap === "string" || formattedMap[0].minimumModRevision <= revision) {
                    innerFormattedMaps.push(formattedMap);
                }
            });


            const innerFormattedMod: formattedMod = {
                id: id,
                revision: revision,
                type: innerType,
                name: name,
                publisherID: publisherID,
                publisherGamebananaID: publisherGamebananaID,
                contentWarning: contentWarning,
                notes: notes,
                shortDescription: shortDescription,
                longDescription: longDescription,
                gamebananaModID: gamebananaModID,
                approved: approvedBool,
                maps: innerFormattedMaps,
            };


            if (rawMod.difficulties) {
                innerFormattedMod.difficulties = formattedDifficultiesArray;
            }


            return innerFormattedMod;
        });


        return outerFormattedMod;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
};




const getSortedDifficultyNames = function (difficulties: difficulties[], modID: number) {
    const parentDifficultyArray: difficulties[] = [];
    const subDifficultiesArray: difficulties[][] = [];

    for (const difficulty of difficulties) {     //iterate through all difficulties
        const parentDifficultyID = difficulty.parentDifficultyID;

        if (parentDifficultyID === null) {      //parent difficulties are added to parentDifficultyArray
            parentDifficultyArray.push(difficulty);
            continue;
        }


        let alreadyListed = false;      //sub-difficulties are added to an array of their siblings, which is an element of subDifficultiesArray

        for (const siblingArray of subDifficultiesArray) {
            if (siblingArray[0].parentDifficultyID === parentDifficultyID) {
                siblingArray.push(difficulty);
                alreadyListed = true;
                break;
            }
        }

        if (!alreadyListed) {
            subDifficultiesArray.push([difficulty]);
        }
    }


    const formattedArray: (string | string[])[] = [];   //the array that will be added to formattedMod

    for (let parentOrder = 1; parentOrder <= parentDifficultyArray.length; parentOrder++) {   //iterate through all parent difficulties
        let parentId = NaN;
        let parentName = "";
        let hasChildren = false;

        for (const difficulty of parentDifficultyArray) {   //find the parent difficulty that matches the current value of parentOrder
            if (difficulty.order === parentOrder) {
                parentId = difficulty.id;
                parentName = difficulty.name;
                break;
            }
        }

        for (const siblingArray of subDifficultiesArray) {      //check any of the sibling arrays contain children of the current parent difficulty
            if (siblingArray[0].parentDifficultyID === parentId) {
                const parentAndChildrenArray = [parentName];    //the parent does have children, so create an array with the parent's name as element 0

                for (let siblingOrder = 1; siblingOrder <= siblingArray.length; siblingOrder++) {   //iterate through the parent's children
                    for (const sibling of siblingArray) {       //find the sibling difficulty that matches the current value of siblingOrder
                        if (sibling.order === siblingOrder) {
                            parentAndChildrenArray.push(sibling.name);  //add the matching sibling's name to the array
                            break;
                        }
                    }
                }

                formattedArray.push(parentAndChildrenArray);    //push the finished array to formattedArray
                hasChildren = true;
                break;
            }
        }

        if (!hasChildren) {     //the parent does not have children, so add it to formattedArray as a string
            formattedArray.push(parentName);
        }
    }


    formattedArray.forEach((parentDifficulty) => {      //check that all orders are continuous
        if (parentDifficulty === "") {
            throw `Parent difficulty orders for mod ${modID} are not continuous`;
        }

        if (parentDifficulty instanceof Array) {
            parentDifficulty.forEach((childDifficulty) => {
                if (childDifficulty === "") {
                    throw `Child difficulty orders for parent difficulty ${parentDifficulty[0]} in mod ${modID} are not continuous`;
                }
            });
        }
    });


    return formattedArray;
}




export const getMapIDsCreationArray = async function (res: Response, maps: jsonCreateMapWithMod[], currentModRevision: number, currentTime: number, modType: mods_details_type,
    publisherName: string, lengthObjectArray: map_lengths[], difficultiesCreationArray: createParentDifficultyForMod[], defaultDifficultyObjectsArray:
        defaultDifficultyForMod[], modHasCustomDifficultiesBool: boolean, modHasSubDifficultiesBool: boolean, submittingUserId: number, req: Request) {
    try {
        const mapIDsCreationArray: mapIdCreationObjectForMod[] = await Promise.all(
            maps.map(
                async (mapObject: jsonCreateMapWithMod) => {
                    const mapIdCreationObject = await getMapIdCreationObject(mapObject, currentModRevision, currentTime, modType, publisherName, lengthObjectArray,
                        difficultiesCreationArray, defaultDifficultyObjectsArray, modHasCustomDifficultiesBool, modHasSubDifficultiesBool, submittingUserId, req);

                    return mapIdCreationObject;
                }
            )
        );

        return mapIDsCreationArray;
    }
    catch (error) {
        if (error === canonicalDifficultyNameErrorMessage) {
            res.status(404).json(canonicalDifficultyNameErrorMessage);
            res.errorSent = true;
            return;
        }
        if (error === techNameErrorMessage) {
            res.status(404).json(techNameErrorMessage);
            res.errorSent = true;
            return;
        }
        if (error === lengthErrorMessage) {
            res.status(404).json(lengthErrorMessage);
            res.errorSent = true;
            return;
        }
        if (typeof error === "string" && error.includes(invalidMapperUserIdErrorMessage)) {
            res.status(404).json(error);
            res.errorSent = true;
            return;
        }
        if (error === invalidMapDifficultyErrorMessage) {
            res.status(400).json(invalidMapDifficultyErrorMessage);
            res.errorSent = true;
            return;
        }

        throw error;
    }
}




const getMapIdCreationObject = async function (mapObject: jsonCreateMapWithMod, currentModRevision: number, currentTime: number, modType: mods_details_type,
    publisherName: string, lengthObjectArray: map_lengths[], customDifficultiesArray: createParentDifficultyForMod[], defaultDifficultyObjectsArray: defaultDifficultyForMod[],
    modHasCustomDifficultiesBool: boolean, modHasSubDifficultiesBool: boolean, submittingUserId: number, req: Request) {

    const minimumModRevision = currentModRevision === 0 ? 0 : (mapObject.minimumModRevision ? mapObject.minimumModRevision : currentModRevision);
    //a currentModVersion of 0 means that this method is being called from /mods POST so any set value for minimumModRevision is ignored

    const mapName = mapObject.name;
    const lengthName = mapObject.length;
    const mapDescription = mapObject.description;
    const mapNotes = mapObject.notes;
    const mapRemovedFromModBool = mapObject.mapRemovedFromModBool;
    const techAny = mapObject.techAny;
    const techFC = mapObject.techFC;
    const canonicalDifficultyName = mapObject.canonicalDifficulty;
    const mapperUserID = mapObject.mapperUserID;
    let mapperNameString = mapObject.mapperNameString;
    const chapter = mapObject.chapter;
    const side = mapObject.side;
    const modDifficulty = mapObject.modDifficulty;
    const overallRank = mapObject.overallRank;


    const canonicalDifficultyID = await getCanonicalDifficultyID(canonicalDifficultyName, techAny);

    const lengthID = await getLengthID(lengthName, lengthObjectArray);


    if (mapperUserID) {
        const userFromID = await prisma.users.findUnique({ where: { id: mapperUserID } });

        if (!userFromID) throw invalidMapperUserIdErrorMessage + `${mapperUserID}`;

        mapperNameString = userFromID.displayName;
    }
    else if (modType === "Normal") {
        mapperNameString = publisherName;
    }
    else if (!mapperNameString) {
        throw "Non-Normal maps must have mapperUserID or mapperNameString";
    }


    const mapIdCreationObject: mapIdCreationObjectForMod = {
        minimumModRevision: minimumModRevision,
        maps_details: {
            create: [{
                name: mapName,
                difficulties_difficultiesTomaps_details_canonicalDifficultyID: { connect: { id: canonicalDifficultyID } },
                map_lengths: { connect: { id: lengthID } },
                description: mapDescription,
                notes: mapNotes,
                mapperNameString: mapperNameString,
                mapRemovedFromModBool: mapRemovedFromModBool,
                timeSubmitted: currentTime,
                users_maps_details_submittedByTousers: { connect: { id: submittingUserId } },
            }],
        },
    };


    const privilegedUserBool = <boolean>await checkPermissions(req, mapStaffPermsArray)

    if (isErrorWithMessage(privilegedUserBool)) throw privilegedUserBool;

    if (privilegedUserBool) {
        mapIdCreationObject.maps_details.create[0].timeApproved = currentTime;
        mapIdCreationObject.maps_details.create[0].users_maps_details_approvedByTousers = { connect: { id: submittingUserId } };
    }


    if (mapperUserID) {
        mapIdCreationObject.maps_details.create[0].users_maps_details_mapperUserIDTousers = { connect: { id: mapperUserID } };
    }


    if (modType === "Normal") {
        mapIdCreationObject.maps_details.create[0].chapter = chapter;
        mapIdCreationObject.maps_details.create[0].side = side;
    }
    else {
        handleNonNormalMods(mapIdCreationObject, modType, overallRank, modDifficulty, customDifficultiesArray,
            defaultDifficultyObjectsArray, modHasCustomDifficultiesBool, modHasSubDifficultiesBool);
    }


    if (techAny || techFC) {
        const techCreationObjectArray: mapToTechCreationObject[] = [];


        maps_to_tech: { create: { tech_list: { connect: { name: "techName" } } } }
        if (techAny) {
            techAny.forEach((techName) => {
                const techCreationObject = {
                    tech_list: { connect: { name: techName } },
                    fullClearOnlyBool: false,
                };

                techCreationObjectArray.push(techCreationObject);
            });
        }


        if (techFC) {
            techFC.forEach((techName) => {
                const techCreationObject = {
                    tech_list: { connect: { name: techName } },
                    fullClearOnlyBool: true,
                };

                techCreationObjectArray.push(techCreationObject);
            });
        }


        mapIdCreationObject.maps_details.create[0].maps_to_tech = { create: techCreationObjectArray };
    }


    return mapIdCreationObject;
};




const handleNonNormalMods = function (mapIdCreationObject: mapIdCreationObjectForMod, modType: mods_details_type,
    overallRank: number | undefined, modDifficulty: string | string[] | undefined, customDifficultiesArray: createParentDifficultyForMod[],
    defaultDifficultyObjectsArray: defaultDifficultyForMod[], modHasCustomDifficultiesBool: boolean, modHasSubDifficultiesBool: boolean) {

    if (modType === "Contest") {
        mapIdCreationObject.maps_details.create[0].overallRank = overallRank;
    }

    if (!modDifficulty) throw invalidMapDifficultyErrorMessage;

    let validModDifficultyBool = false;

    if (modHasCustomDifficultiesBool) {
        if (!customDifficultiesArray.length) throw "customDifficultiesArray is empty";

        if (typeof modDifficulty === "string") {
            for (const difficulty of customDifficultiesArray) {
                if (typeof modDifficulty !== "string") throw invalidMapDifficultyErrorMessage;

                if (difficulty.name === modDifficulty) {
                    mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: difficulty.id } };
                    validModDifficultyBool = true;
                    break;
                }
            }
        }
        else {
            for (const difficulty of customDifficultiesArray) {
                if (!difficulty.other_difficulties) continue;

                if (difficulty.name === modDifficulty[0]) {
                    for (const childDifficulty of difficulty.other_difficulties.create) {
                        if (childDifficulty.name === modDifficulty[1]) {
                            mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: childDifficulty.id } };
                            validModDifficultyBool = true;
                            break;
                        }
                    }

                    break;
                }
            }
        }
    }
    else {
        if (!defaultDifficultyObjectsArray.length) throw "defaultDifficultyObjectsArray is empty";

        if (!(modDifficulty instanceof Array)) throw invalidMapDifficultyErrorMessage;

        for (const difficulty of defaultDifficultyObjectsArray) {
            if (!difficulty.other_difficulties || !difficulty.other_difficulties.length) continue;

            if (difficulty.name === modDifficulty[0]) {
                for (const childDifficulty of difficulty.other_difficulties) {
                    if (childDifficulty.name === modDifficulty[1]) {
                        validModDifficultyBool = true;
                        mapIdCreationObject.maps_details.create[0].difficulties_difficultiesTomaps_details_modDifficultyID = { connect: { id: childDifficulty.id } };
                        break;
                    }
                }

                break;
            }
        }
    }

    if (!validModDifficultyBool) throw "invalid modDifficulty";
}




export const getCanonicalDifficultyID = async function (canonicalDifficultyName: string | null | undefined, techAny: string[] | undefined) {
    const parentDefaultDifficultyObjectsArray = await prisma.difficulties.findMany({
        where: {
            parentModID: null,
            parentDifficultyID: null,
        },
    });


    if (canonicalDifficultyName) {
        for (const parentDifficulty of parentDefaultDifficultyObjectsArray) {
            if (parentDifficulty.name === canonicalDifficultyName) {
                return parentDifficulty.id;
            }
        }

        throw canonicalDifficultyNameErrorMessage;
    }
    else {
        if (!techAny) {
            let easiestDifficultyID = 0;
            let easiestDifficultyOrder = 99999;
            for (const parentDifficulty of parentDefaultDifficultyObjectsArray) {
                if (parentDifficulty.order === easiestDifficultyOrder) {
                    throw "Two default parent difficulties have the same order";
                }
                if (parentDifficulty.order < easiestDifficultyOrder) {
                    easiestDifficultyID = parentDifficulty.id;
                    easiestDifficultyOrder = parentDifficulty.order;
                }
            }

            if (easiestDifficultyID === 0 || easiestDifficultyOrder === 99999) {
                throw "Unable to find easiest parent default difficulty";
            }

            return easiestDifficultyID;
        }

        const techObjectsWithDifficultyObjectsArray = await prisma.tech_list.findMany({ include: { difficulties: true } });

        let highestDifficultyID = 0;
        let highestDifficultyOrder = 0;

        for (const techName of techAny) {
            let validTechName = false;

            for (const techObject of techObjectsWithDifficultyObjectsArray) {
                if (techObject.name === techName) {
                    const difficultyOrder = techObject.difficulties.order;
                    validTechName = true;

                    if (difficultyOrder === highestDifficultyOrder) {
                        throw "Two default parent difficulties have the same order";
                    }

                    if (difficultyOrder > highestDifficultyOrder) {
                        highestDifficultyID = techObject.defaultDifficultyID;
                        highestDifficultyOrder = difficultyOrder;
                    }

                    break;
                }
            }

            if (!validTechName) {
                throw techNameErrorMessage;
            }
        }

        if (highestDifficultyID === 0) {
            throw "Unable to find highestDifficultyID";
        }

        return highestDifficultyID;
    }
}




export const connectMapsToModDifficulties = async function (rawMod: rawMod) {
    const modID = rawMod.id;
    throw "unimplemented";
}




export const formatMap = async function (rawMap: rawMap, rawMod?: rawMod) {
    try {
        if (rawMap.maps_details.length < 1) return noMapDetailsErrorMessage;

        const id = rawMap.id;
        const modID = rawMap.modID;
        const minimumModRevision = rawMap.minimumModRevision;

        const modType = rawMod ? rawMod.mods_details[0].type : rawMap.mods_ids?.mods_details[0].type;
        if (!modType) throw `modType is undefined for map ${id}`;

        const publisherName = rawMod ? rawMod.mods_details[0].publishers.name : rawMap.mods_ids?.mods_details[0].publishers.name;
        if (!publisherName) throw `publisherName is undefined for map ${id}`;


        const outerFormattedMap = await Promise.all(
            rawMap.maps_details.map(
                async (mapDetails) => {
                    const revision = mapDetails.revision;
                    const name = mapDetails.name;
                    const canonicalDifficulty = mapDetails.difficulties_difficultiesTomaps_details_canonicalDifficultyID.name;
                    const length = mapDetails.map_lengths.name;
                    const description = mapDetails.description === null ? undefined : mapDetails.description;
                    const notes = mapDetails.notes === null ? undefined : mapDetails.notes;
                    const mapRemovedFromModBool = mapDetails.mapRemovedFromModBool;
                    const approvedBool = mapDetails.timeApproved === null ? false : true;


                    const mapperUserID = mapDetails.mapperUserID === null ? undefined : mapDetails.mapperUserID;
                    let mapperNameString: string;

                    if (mapperUserID) {
                        if (!mapDetails.users_maps_details_mapperUserIDTousers) {
                            throw `mapDetails.users_maps_details_mapperUserIDTousers is unexpectedly undefined for map ${id}`;
                        }

                        mapperNameString = mapDetails.users_maps_details_mapperUserIDTousers?.displayName;

                        if (mapperNameString !== mapDetails.mapperNameString) {
                            await prisma.maps_details.update({
                                where: { id: mapDetails.id },
                                data: { mapperNameString: mapperNameString },
                            });
                        }
                    }
                    else if (modType === "Normal") {
                        mapperNameString = publisherName

                        if (mapperNameString !== mapDetails.mapperNameString) {
                            await prisma.maps_details.update({
                                where: { id: mapDetails.id },
                                data: { mapperNameString: mapperNameString },
                            });
                        }
                    }
                    else {
                        mapperNameString = mapDetails.mapperNameString;
                    }


                    const innerFormattedMap: formattedMap = {
                        id: id,
                        revision: revision,
                        modID: modID,
                        minimumModRevision: minimumModRevision,
                        name: name,
                        canonicalDifficulty: canonicalDifficulty,
                        length: length,
                        description: description,
                        notes: notes,
                        mapperUserID: mapperUserID,
                        mapperNameString: mapperNameString,
                        mapRemovedFromModBool: mapRemovedFromModBool,
                        approved: approvedBool,
                    }


                    const techAny: string[] = [];
                    const techFC: string[] = [];

                    if (mapDetails.maps_to_tech) {
                        for (const tech of mapDetails.maps_to_tech) {
                            if (tech.fullClearOnlyBool) {
                                techFC.push(tech.tech_list.name);
                            }
                            else {
                                techAny.push(tech.tech_list.name);
                            }
                        }

                        if (techAny.length) innerFormattedMap.techAny = techAny;
                        if (techFC.length) innerFormattedMap.techFC = techFC;
                    }


                    if (modType === "Normal") {
                        const chapter = mapDetails.chapter === null ? undefined : mapDetails.chapter;
                        const side = mapDetails.side === null ? undefined : mapDetails.side;

                        if (!chapter || !side) throw `Chapter or side is null in Normal map ${id}`;

                        innerFormattedMap.chapter = chapter;
                        innerFormattedMap.side = side;
                    }
                    else {
                        const modDifficulty = mapDetails.difficulties_difficultiesTomaps_details_modDifficultyID?.name;

                        if (!modDifficulty) throw `modDifficulty is undefined in non-Normal map ${id}`;

                        innerFormattedMap.modDifficulty = modDifficulty;


                        if (modType === "Contest") {
                            const overallRank = mapDetails.overallRank === null ? undefined : mapDetails.overallRank;

                            innerFormattedMap.overallRank = overallRank;
                        }
                    }


                    return innerFormattedMap;
                }));


        return outerFormattedMap;
    }
    catch (error) {
        return (toErrorWithMessage(error));
    }
};





export const param_modID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.modID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("modID is not a number");
            return;
        }

        const modFromID = await prisma.mods_ids.findUnique({
            where: { id: id },
            include: {
                difficulties: true,
                mods_details: {
                    where: { NOT: { timeApproved: null } },
                    orderBy: { revision: "desc" },
                    take: 1,
                    include: { publishers: true },
                },
                maps_ids: {
                    where: { maps_details: { some: { NOT: { timeApproved: null } } } },
                    include: {
                        maps_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech: { include: { tech_list: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!modFromID) {
            res.status(404).json("modID does not exist");
            return;
        }

        req.mod = modFromID;
        req.id = id;
        next();
    }
    catch (error) {
        next(error);
    }
}


export const param_modRevision = <expressRoute>async function (req, res, next) {
    try {
        const modID = <number>req.id;
        const revisionRaw: unknown = req.params.modRevision;
        const revision = Number(revisionRaw);

        if (isNaN(revision)) {
            res.status(400).json("revision is not a number");
            return;
        }

        const modFromID = await prisma.mods_ids.findUnique({
            where: { id: modID },
            include: {
                difficulties: true,
                mods_details: {
                    where: { revision: revision },
                    include: { publishers: true },
                },
                maps_ids: {
                    include: {
                        maps_details: {
                            orderBy: { revision: "desc" },
                            include: {
                                map_lengths: true,
                                difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                                difficulties_difficultiesTomaps_details_modDifficultyID: true,
                                users_maps_details_mapperUserIDTousers: true,
                                maps_to_tech: { include: { tech_list: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!modFromID || !modFromID.mods_details.length) {
            res.status(404).json(`Revision ${revision} does not exist for specified modID`);
            return;
        }

        req.revision = revision;
        next();
    }
    catch (error) {
        next(error);
    }
}


export const param_mapID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.mapID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("mapID is not a number");
            return;
        }

        const rawMap = await prisma.maps_ids.findUnique({
            where: { id: id },
            include: {
                mods_ids: {
                    include: {
                        mods_details: {
                            where: { NOT: { timeApproved: null } },
                            orderBy: { revision: "desc" },
                            take: 1,
                            include: { publishers: true },
                        },
                    },
                },
                maps_details: {
                    where: { NOT: { timeApproved: null } },
                    orderBy: { revision: "desc" },
                    take: 1,
                    include: {
                        map_lengths: true,
                        difficulties_difficultiesTomaps_details_canonicalDifficultyID: true,
                        difficulties_difficultiesTomaps_details_modDifficultyID: true,
                        users_maps_details_mapperUserIDTousers: true,
                        maps_to_tech: { include: { tech_list: true } },
                    },
                },
            },
        });

        if (!rawMap) {
            res.status(404).json("mapID does not exist");
            return;
        }

        req.map = rawMap;
        req.id = id;
        next();
    }
    catch (error) {
        next(error);
    }
}


export const param_mapRevision = <expressRoute>async function (req, res, next) {
    try {
        const mapID = <number>req.id;
        const revisionRaw: unknown = req.params.mapRevision;
        const revision = Number(revisionRaw);

        if (isNaN(revision)) {
            res.status(400).json("revision is not a number");
            return;
        }

        const mapFromID = await prisma.maps_ids.findFirst({
            where: {
                id: mapID,
                maps_details: { some: { revision: revision } },
            },
        });

        if (!mapFromID) {
            res.status(404).json(`revision ${revision} does not exist for specified mapID`);
            return;
        }

        req.revision = revision;
        next();
    }
    catch (error) {
        next(error);
    }
}


export const param_publisherID = <expressRoute>async function (req, res, next) {
    try {
        const idRaw: unknown = req.params.publisherID;

        const id = Number(idRaw);

        if (isNaN(id)) {
            res.status(400).json("publisherID is not a number");
            return;
        }

        const publisherFromID = await prisma.publishers.findUnique({
            where: { id: id },
            include: { users: true },
        });

        if (!publisherFromID) {
            res.status(404).json("publisherID does not exist");
            return;
        }

        req.publisher = publisherFromID;
        req.id = id;
        next();
    }
    catch (error) {
        next(error);
    }
}










export const getGamebananaUsernameById = async function (gamebananaID: number) {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Member/IdentifyById?userid=${gamebananaID}`
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            throw gamebananaApiError;
        }

        const gamebananaName = String(axiosResponse.data[0]);

        return gamebananaName;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




const getGamebananaIdByUsername = async function (gamebananaUsername: string) {
    try {
        const options = {
            url: `https://api.gamebanana.com/Core/Member/Identify?username=${gamebananaUsername}`
        };

        const axiosResponse = await axios(options);

        if (axiosResponse.status != 200) {
            throw gamebananaApiError;
        }

        let gamebananaID = Number(axiosResponse.data[0]);

        if (isNaN(gamebananaID)) {
            gamebananaID = -1;
        }

        return gamebananaID;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const patchPublisherWithGamebananaID = async function (id: number, gamebananaID: number, userID: number | null | undefined, publisherFromId: publishers) {
    try {
        const gamebananaUsername = await getGamebananaUsernameById(gamebananaID);

        if (isErrorWithMessage(gamebananaUsername)) throw gamebananaUsername;

        if (!userID) {
            userID = publisherFromId.userID === null ? undefined : publisherFromId.userID;
        }

        const rawPublisher = await prisma.publishers.update({
            where: { id: id },
            data: {
                gamebananaID: gamebananaID,
                name: gamebananaUsername,
                users: { connect: { id: userID } },
            },
            include: { users: true },
        });

        return rawPublisher;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const patchPublisherWithUserID = async function (userFromID: users, id: number, publisherFromId: publishers) {
    try {
        let name: string;

        if (publisherFromId.gamebananaID) {
            name = publisherFromId.name;
        }
        else {
            name = userFromID.displayName;
        }

        const rawPublisher = await prisma.publishers.update({
            where: { id: id },
            data: {
                name: name,
                users: { connect: { id: userFromID.id } },
            },
            include: { users: true },
        });

        return rawPublisher;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const patchPublisherWithName = async function (id: number, name: string) {
    try {
        const rawPublisher = await prisma.publishers.update({
            where: { id: id },
            data: {
                name: name,
            },
            include: { users: true },
        });

        return rawPublisher;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}




export const formatPublisher = async function (rawPublisher: rawPublisher) {
    try {
        const id = rawPublisher.id;
        const gamebananaID = rawPublisher.gamebananaID;
        const userID = rawPublisher.userID;


        let name = "";
        if (userID) {
            if (!rawPublisher.users) throw `users is unexpectedly null for publisher ${id}`;

            const displayName = rawPublisher.users.displayName;

            if (name !== displayName) {
                await prisma.publishers.update({
                    where: { id: id },
                    data: { name: displayName },
                });
            }

            name = displayName;
        }
        else if (gamebananaID) {
            try {
                const gbUsername = await getGamebananaUsernameById(gamebananaID);

                if (isErrorWithMessage(gbUsername)) throw gbUsername;

                if (gbUsername !== rawPublisher.name) {
                    await prisma.publishers.update({
                        where: { id: id },
                        data: { name: gbUsername },
                    });
                }

                name = gbUsername;
            }
            catch (error) {
                if (error === gamebananaApiError) {
                    if (rawPublisher.name) {
                        name = rawPublisher.name;
                    }
                    else {
                        throw `publisher ${id} has no name set, and a name value cannot currently be acquired from GameBanana`;
                    }
                }
                else {
                    throw error;
                }
            }
        }
        else if (rawPublisher.name) {
            name = rawPublisher.name;
        }
        else {
            throw `no name in rawPublisher ${id}`;
        }


        if (name === "") throw `no name generated while formatting publisher ${id}`;


        const formattedPublisher: formattedPublisher = {
            id: id,
            name: name,
        }

        if (gamebananaID) {
            formattedPublisher.gamebananaID = gamebananaID;
        }

        if (userID) {
            formattedPublisher.userID = userID;
        }


        return formattedPublisher;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}
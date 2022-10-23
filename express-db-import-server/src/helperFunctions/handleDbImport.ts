import { map_lengths } from "@prisma/client";
import { prisma } from "../middlewaresAndConfigs/prismaClient";

import { Difficulty, NameAndDescription, CreateDifficultyDataForImport, CreateTechDataForImport, CreateUserDataForImport, Maps, Publisher } from "../types/handleDbImport";




export const difficultyNamesArray = ["Beginner", "Intermediate", "Advanced", "Expert", "Grandmaster"] as const;




export const importDifficultiesAndTechs = async (difficulties: Difficulty[], subDifficulties: NameAndDescription[]) => {
    console.log("importing difficulties and techs");


    const parentDifficultyCount = difficulties.length;
    const subDifficultyCount = subDifficulties.length;
    let runningTechCount = 0;


    const difficultyCreationObjects: CreateDifficultyDataForImport[] = [];
    const techCreationObjects: CreateTechDataForImport[] = [];

    difficulties.forEach((parentDifficulty, parentDifficultyIndex) => {
        const parentDifficultyID = parentDifficultyIndex + 1;

        const parentDifficultyCreationObject: CreateDifficultyDataForImport = {
            id: parentDifficultyID,
            name: parentDifficulty.name,
            description: parentDifficulty.description || null,
            parentModID: null,
            parentDifficultyID: null,
            order: parentDifficultyID,
        };


        const subDifficultyCreationObjects: CreateDifficultyDataForImport[] = subDifficulties.map((subDifficulty, subDifficultyIndex) => {
            const subDifficultyID = parentDifficultyCount + (parentDifficultyIndex * subDifficultyCount) + subDifficultyIndex + 1;

            return {
                id: subDifficultyID,
                name: subDifficulty.name,
                description: subDifficulty.description,
                parentModID: null,
                parentDifficultyID: parentDifficultyID,
                order: subDifficultyIndex + 1,
            };
        });


        difficultyCreationObjects.push(parentDifficultyCreationObject, ...subDifficultyCreationObjects);


        const techNamesArray = parentDifficulty.techs.split(", ");

        const difficultyTechCreationObjects: CreateTechDataForImport[] = techNamesArray.map((techName, techIndex) => {
            const techID = runningTechCount + techIndex + 1;

            return {
                id: techID,
                name: techName,
                defaultDifficultyID: parentDifficultyID,
            };
        });

        runningTechCount += techNamesArray.length;
        techCreationObjects.push(...difficultyTechCreationObjects);
    });


    await prisma.difficulties.createMany({ data: difficultyCreationObjects });
    await prisma.tech_list.createMany({ data: techCreationObjects });


    return { difficultyCreationObjects, techCreationObjects };
}




export const importLengths = async (lengths: NameAndDescription[]) => {
    console.log("importing lengths");


    const lengthCreationObjects: map_lengths[] = lengths.map((length, index) => {
        const lengthID = index + 1;

        return {
            id: lengthID,
            name: length.name,
            description: length.description,
            order: lengthID,
        };
    });


    await prisma.map_lengths.createMany({ data: lengthCreationObjects });


    return lengthCreationObjects;
}




export const importDiscordTags = async (discordTags: string[], currentTime: number) => {
    console.log("importing discord tags");


    const userCreationObjects: CreateUserDataForImport[] = discordTags.map((discordTag, index) => {
        const userID = index + 1;

        const numberSignIndex = discordTag.lastIndexOf("#");
        const discordUsername = discordTag.substring(0, numberSignIndex - 1);
        const discordDiscrim = discordTag.substring(numberSignIndex + 1);

        return {
            id: userID,
            displayName: discordTag,
            discordID: null,
            discordUsername: discordUsername,
            discordDiscrim: discordDiscrim,
            displayDiscord: false,
            showCompletedMaps: false,
            timeCreated: currentTime,
            permissions: "",
        };
    });


    await prisma.users.createMany({ data: userCreationObjects });


    return userCreationObjects;
}




export const importPublishers = async (publishers: Publisher[], userCreationObjects: CreateUserDataForImport[]) => {
    console.log("importing publishers");


    const publisherCreationObjects = publishers.map((publisher, index) => {
        const publisherID = index + 1;
        const publisherName = publisher.name;


        let matchingUserId = 0;

        for (const userCreationObject of userCreationObjects) {
            const discordUsername = userCreationObject.discordUsername;

            if (discordUsername === publisherName) {
                matchingUserId = userCreationObject.id;
                break;
            }
        }


        if (matchingUserId === 0) {
            return {
                id: publisherID,
                gamebananaID: publisher.publisherGamebananaID,
                name: publisherName,
            };
        }
        else {
            return {
                id: publisherID,
                gamebananaID: publisher.publisherGamebananaID,
                name: publisherName,
                users: { connect: { id: matchingUserId } },
            };
        }
    });


    await prisma.publishers.createMany({ data: publisherCreationObjects });


    return publisherCreationObjects;
}
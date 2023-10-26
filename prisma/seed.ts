import { PrismaClient, ModType, type Difficulty, type Quality, type Tech, type Length, type User } from "@prisma/client";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import { randomInteger, randomString, randomElement, randomIntegers, randomPairs } from "~/utils/randomValueGenerators";


const prisma = new PrismaClient();




const seedRandomData = async () => {
    const parentDifficulties: Difficulty[] = [];
    const childDifficulties: Difficulty[] = [];

    for (let i = 1; i <= 5; i++) {
        const difficulty = await prisma.difficulty.create({
            data: {
                name: "Difficulty" + i,
                description: "Example parent difficulty " + i,
                parentDifficultyId: 0,
                order: i,
            }
        });


        for (let j = 1; j <= 3; j++) {
            childDifficulties.push(
                await prisma.difficulty.create({
                    data: {
                        name: `Difficulty${i}: ChildDifficulty${j}`,
                        description: `Example child difficulty ${i}-${j}`,
                        parentDifficultyId: difficulty.id,
                        order: j,
                    }
                })
            );
        }


        parentDifficulties.push(difficulty);
    }


    const techs: Tech[] = [];

    for (let i = 1; i <= 30; i++) {
        techs.push(
            await prisma.tech.create({
                data: {
                    name: "ExampleTech" + i,
                    difficultyId: randomElement(parentDifficulties).id,
                }
            })
        );
    }


    const qualities: Quality[] = [];

    for (let i = 1; i <= 5; i++) {
        qualities.push(
            await prisma.quality.create({
                data: {
                    name: "ExampleQuality" + i,
                    description: "Example quality " + i,
                    order: i,
                }
            })
        );
    }


    const lengths: Length[] = [];

    for (let i = 1; i <= 5; i++) {
        lengths.push(
            await prisma.length.create({
                data: {
                    name: "ExampleLength" + i,
                    description: "Example length " + i,
                    order: i,
                }
            })
        );
    }


    const users: User[] = [];

    for (let i = 0; i < 200; i++) {
        const name = 'User' + randomString(30);


        users.push(
            await prisma.user.create({
                data: {
                    id: name,
                    name,
                    discordUsername: name,
                    discordDiscriminator: "9999",
                    displayDiscord: false,
                    showCompletedMaps: false,
                    accountStatus: "Unlinked",
                },
            })
        );
    }


    const publisherGameBananaIds = randomIntegers(20, 0, 10000000); // GameBananaIds must be unique.

    const publishers = await Promise.all(
        publisherGameBananaIds.map(
            async (gameBananaId, index) => await prisma.publisher.create({
                data: {
                    gamebananaId: gameBananaId,
                    name: 'ExamplePublisher' + (index + 1),
                }
            })
        )
    );


    const modTypes = getNonEmptyArray(ModType);
    const modGameBananaIds = randomIntegers(100, 1000, 300000);  // GameBananaIds must be unique.

    const mods = await Promise.all(modGameBananaIds.map(
        async gameBananaId => {
            const timeCreatedGamebanana = randomInteger(1500000000, 1600000000);
            const timeSubmitted = randomInteger(timeCreatedGamebanana, timeCreatedGamebanana + 1000000);
            const timeApproved = randomInteger(timeSubmitted, timeSubmitted + 1000000);


            return await prisma.mod.create({
                data: {
                    type: randomElement(modTypes),
                    name: 'Mod' + randomString(20),
                    publisherId: randomElement(publishers).id,
                    shortDescription: "A example mod",
                    gamebananaModId: gameBananaId,
                    timeSubmitted,
                    submittedBy: "CelesteModsList",
                    timeApproved,
                    approvedBy: "CelesteModsList",
                    timeCreatedGamebanana,
                }
            });
        }
    ));


    const maps = [];

    for (let i = 0; i < 30; i++) {
        const mod = randomElement(mods);
        const timeSubmitted = randomInteger(mod.timeApproved, mod.timeApproved + 10000000);
        const timeApproved = randomInteger(timeSubmitted, timeSubmitted + 1000000);


        maps.push(
            await prisma.map.create({
                data: {
                    name: 'Map' + randomString(15),
                    mapperNameString: 'Mapper' + randomString(20),
                    timeSubmitted,
                    timeApproved,
                    canonicalDifficultyId: randomElement(parentDifficulties).id,
                    modId: randomElement(mods).id,
                    lengthId: randomElement(lengths).id,
                }
            })
        );
    }


    //The combination of map and submitted by must be unique.
    const mapsAndSubmittedBy = randomPairs(20, maps, users);

    await Promise.all(mapsAndSubmittedBy.map(async ([map, submittedBy]) =>
        await prisma.rating.create({
            data: {
                timeSubmitted: randomInteger(map.timeApproved, map.timeApproved + 10000000),
                submittedBy: submittedBy.id,
                mapId: map.id,
                qualityId: randomElement(qualities).id,
                difficultyId: randomElement(childDifficulties).id,
            }
        }))
    );
};




const main = async () => {
    await prisma.user.create({
        data: {
            id: "CelesteModsList",
            name: "CelesteModsList",
            discordUsername: "CelesteModsList",
            discordDiscriminator: "9999",
            displayDiscord: false,
            showCompletedMaps: false,
            accountStatus: "Unlinked",
        },
    });


    await prisma.difficulty.create({
        data: {
            id: 1,  //setting id to 0 here doesn't actually work (MySQL things), so we do it later
            name: "nullParent",
            parentDifficultyId: null,
            order: 1,
        },
    });

    await prisma.difficulty.update({
        where: { id: 1 },
        data: { id: 0 },
    });


    if (process.env.SEED_RANDOM_DATA) await seedRandomData();
};




main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
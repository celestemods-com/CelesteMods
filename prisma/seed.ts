import { ModType, PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();




/** Random integer from min (included) to max (excluded). */
const randomInteger = (min: number, max: number) => {
    return min + Math.floor(Math.random() * (max - min));
};


const randomString = (size: number) => {
    const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';


    let result = '';

    for (let i = 0; i < size; i++) {
        result += CHARACTERS[randomInteger(0, CHARACTERS.length)];
    }


    return result;
};


const randomElement = <T>(array: T[]) => {
    if (array.length === 0) {
        return null;
    }


    return array[randomInteger(0, array.length)];
};


/**
 * List of distinct integers from min (included) to max (excluded).
 * The function keeps randomly choosing numbers until it gets a distinct number, so only use this function when n is relatively smaller than max - min.
 */
const randomIntegers = (n: number, min: number, max: number) => {
    const numbers: number[] = [];


    for (let i = 0; i < n; i++) {
        let number = randomInteger(min, max);

        while (numbers.findIndex(value => value === number) !== -1) {
            number = randomInteger(min, max);
        }


        numbers.push(number);
    }


    return numbers;
};




const seedRandomData = async () => {
    const difficulties = [];

    for (let i = 0; i < 10; i++) {
        difficulties.push(
            await prisma.difficulty.create({
                data: {
                    name: "ExampleDifficulty" + (i + 1),
                    description: "Example difficulty " + (i + 1),
                    parentDifficultyId: 0,
                    order: i + 2,
                }
            })
        );
    }


    const techs = [];

    for (let i = 1; i <= 10; i++) {
        techs.push(
            await prisma.tech.create({
                data: {
                    name: "ExampleTech" + i,
                    difficultyId: randomElement(difficulties)!.id
                }
            })
        );
    }


    const qualities = [];

    for (let i = 1; i <= 10; i++) {
        qualities.push(
            await prisma.quality.create({
                data: {
                    name: "ExampleQuality" + i,
                    description: "Example quality " + i,
                    order: i
                }
            })
        );
    }


    const lengths = [];

    for (let i = 1; i <= 10; i++) {
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


    const users = [];

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
    const publishers = [];

    for (let i = 0; i < publisherGameBananaIds.length; i++) {
        publishers.push(
            await prisma.publisher.create({
                data: {
                    gamebananaId: publisherGameBananaIds[i]!,
                    name: 'ExamplePublisher' + (i + 1),
                }
            })
        );
    }


    const modTypes = [ModType.Normal, ModType.Collab, ModType.Contest, ModType.LobbyOther];
    const modGameBananaIds = randomIntegers(50, 1000, 300000);  // GameBananaIds must be unique.
    const mods = [];

    for (let i = 0; i < modGameBananaIds.length; i++) {
        const timeCreatedGamebanana = randomInteger(1500000000, 160000000);
        const timeSubmitted = randomInteger(timeCreatedGamebanana, timeCreatedGamebanana + 1000000);
        const timeApproved = randomInteger(timeSubmitted, timeSubmitted + 1000000);


        mods.push(
            await prisma.mod.create({
                data: {
                    type: randomElement(modTypes)!,
                    name: 'Mod' + randomString(20),
                    publisherId: randomElement(publishers)!.id,
                    shortDescription: "A example mod",
                    gamebananaModId: modGameBananaIds[i]!,
                    timeSubmitted,
                    submittedBy: "CelesteModsList",
                    timeApproved,
                    approvedBy: "CelesteModsList",
                    timeCreatedGamebanana,
                }
            })
        );
    }


    const maps = [];

    for (let i = 0; i < 30; i++) {
        const mod = randomElement(mods)!;
        const timeSubmitted = randomInteger(mod.timeApproved, mod.timeApproved + 10000000);
        const timeApproved = randomInteger(timeSubmitted, timeSubmitted + 1000000);


        maps.push(
            await prisma.map.create({
                data: {
                    name: 'Map' + randomString(15),
                    mapperNameString: 'Mapper' + randomString(20),
                    timeSubmitted,
                    timeApproved,
                    canonicalDifficultyId: randomElement(difficulties)!.id,
                    modId: randomElement(mods)!.id,
                    lengthId: randomElement(lengths)!.id,
                }
            })
        );
    }


    const ratings = [];
    const mapsAndSubmittedBy = randomIntegers(20, 0, maps.length * users.length);   //The combination of map and submitted by must be unique.

    for (let i = 0; i < mapsAndSubmittedBy.length; i++) {
        const mapAndSubmittedBy = mapsAndSubmittedBy[i]!;
        const map = maps[Math.floor(mapAndSubmittedBy / users.length)]!;
        const submittedBy = users[mapAndSubmittedBy % users.length]!.id;


        ratings.push(
            await prisma.rating.create({
                data: {
                    timeSubmitted: randomInteger(map.timeApproved, map.timeApproved + 10000000),
                    submittedBy,
                    mapId: map.id,
                    qualityId: randomElement(qualities)!.id,
                }
            })
        );
    }
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
}




main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
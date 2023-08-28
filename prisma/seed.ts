import { ModType, PrismaClient, Publisher } from "@prisma/client";


const prisma = new PrismaClient();

// Random integer from 0 (included) to n (excluded).
function randomInteger(n: number) {
    return Math.floor(Math.random() * n);
}

function randomString(size: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    for (let _ = 0; _ < size; _++) {
        res += characters[randomInteger(characters.length)];
    }
    return res;
}

function randomElement<T>(array: T[]) {
    if (array.length === 0) {
        return null;
    }
    return (array[randomInteger(array.length)] as T);
}

async function main() {
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

    if (process.env.NODE_ENV === 'development') {
        const difficulties = [];
        for (let i = 0; i < 10; i++) {
            difficulties.push(
                await prisma.difficulty.create({
                    data: {
                        name: "ExampleDifficulty" + randomString(3),
                        description: "ExampleDescription" + randomString(100),
                        parentDifficultyId: 0,
                        order: i + 2,
                    }
                })
            );
        }

        const publishers = [];
        for (let i = 0; i < 20; i++) {
            publishers.push(
                await prisma.publisher.create({
                    data: {
                        gamebananaId: Math.floor(Math.random() * 10000000),
                        name: 'ExamplePublisher' + randomString(10),
                    }
                })
            );
        }

        const modTypes = [ModType.Normal, ModType.Collab, ModType.Contest, ModType.LobbyOther];

        const mods = [];
        for (let i = 0; i < 100; i++) {
            const publisherId = (randomElement(publishers) as Publisher).id;
            const timeCreatedGamebanana = 1500000000 + randomInteger(100000000);
            const timeSubmitted = timeCreatedGamebanana + randomInteger(1000000);
            const timeApproved = timeSubmitted + randomInteger(1000000);
            mods.push(
                await prisma.mod.create({
                    data: {
                        type: randomElement(modTypes) as ModType,
                        name: "ExampleMod" + randomString(20),
                        publisherId,
                        shortDescription: "A example mod",
                        gamebananaModId: randomInteger(10000000),
                        timeSubmitted,
                        submittedBy: "CelesteModsList",
                        timeApproved,
                        approvedBy: "CelesteModsList",
                        timeCreatedGamebanana,
                    }
                })
            );
        }
    }
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
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();




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
import { prisma } from "../middlewaresAndConfigs/prismaClient"





export const isValidDifficultyID = async function (id: number, requireDefault = false, requireChild = false) {
    const rawDifficulty = await prisma.difficulties.findUnique({ where: { id: id } });

    if (!rawDifficulty) return;

    if (requireDefault && rawDifficulty.parentModID !== null) return;

    if (requireChild && rawDifficulty.parentDifficultyID === null) return;


    return rawDifficulty;
}
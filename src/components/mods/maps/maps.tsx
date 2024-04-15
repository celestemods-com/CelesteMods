import { Stack, Title } from "@mantine/core";
import type { Difficulty, Length, MapRatingData, MapYesRatingData, MapWithTechInfo, MapWithTechAndRatingInfo, Quality, Mod } from "~/components/mods/types";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";
import { MapsTable } from "./mapsTable";
import type { DifficultyColor } from "~/styles/difficultyColors";




export type MapsProps = {
    isLoadingMod: boolean;
    modType: Mod["type"];
    isMapperNameVisiblePermitted: boolean;
    mapsWithTechInfo: MapWithTechInfo[];
    colors: DifficultyColor;
};




const getMapsWithTechAndRatingInfo = (
    isLoading: boolean,
    mapsWithTechInfo: MapWithTechInfo[],
    ratingsFromMapIds: MapRatingData[],
    lengths: Length[],
    qualities: Quality[],
    difficulties: Difficulty[],
): MapWithTechAndRatingInfo[] => {
    if (isLoading) return [];


    const mapsWithTechAndRatingInfo: MapWithTechAndRatingInfo[] = mapsWithTechInfo.map(
        (mapWithTechInfo) => {
            const rating = ratingsFromMapIds.find((rating) => rating.mapId === mapWithTechInfo.id);

            if (rating === undefined) throw `Map ${mapWithTechInfo.id} has an undefined rating - this should not happen.`;


            //get length info from map
            const length = lengths.find((length) => length.id === mapWithTechInfo.lengthId);

            if (!length) throw `Length ${mapWithTechInfo.lengthId}, linked to map ${mapWithTechInfo.id}, not found. This should not happen.`;


            //get quality and difficulty info from rating. this is more complicated than lengths because ratings are optional.
            let overallCount = 0;
            let qualityId = -1;
            let qualityName: string;
            let qualityCount = 0;
            let difficultyId = -1;
            let difficultyName: string;
            let difficultyCount = 0;

            if ("overallCount" in rating === false) {   //no ratings exist for this map
                qualityName = noRatingsFoundMessage;
                difficultyName = noRatingsFoundMessage;
            } else {                                    //ratings exist for this map        
                const narrowedRating = rating as MapYesRatingData;

                overallCount = narrowedRating.overallCount;
                qualityCount = narrowedRating.qualityCount;
                difficultyCount = narrowedRating.difficultyCount;

                if (narrowedRating.averageQualityId) qualityId = narrowedRating.averageQualityId;

                if (narrowedRating.averageDifficultyId) difficultyId = narrowedRating.averageDifficultyId;
            }


            if (qualityId === -1) qualityName = noRatingsFoundMessage;
            else {
                if (qualityCount === 0) throw `Quality count is 0 for map ${mapWithTechInfo.id} but qualityId is ${qualityId} (and not -1) - this should not happen.`;


                const quality = qualities.find((quality) => quality.id === qualityId);

                if (!quality) throw `Quality ${qualityId} not found. This should not happen.`;


                qualityName = quality.name;
            }


            if (difficultyId === -1) difficultyName = noRatingsFoundMessage;
            else {
                if (difficultyCount === 0) throw `Difficulty count is 0 for map ${mapWithTechInfo.id} but difficultyId is ${difficultyId} (and not -1) - this should not happen.`;


                const difficulty = difficulties.find((difficulty) => difficulty.id === difficultyId);

                if (!difficulty) throw `Difficulty ${difficultyId} not found. This should not happen.`;


                difficultyName = difficulty.name;
            }


            const chapterSide = `${mapWithTechInfo.chapter ?? ""}${mapWithTechInfo.side ?? ""}`;


            return {
                ...mapWithTechInfo,
                lengthName: length.name,
                overallCount,
                qualityName,
                qualityCount,
                difficultyName,
                difficultyCount,
                chapterSide,
            };
        }
    );


    return mapsWithTechAndRatingInfo;
};





export const Maps = ({
    isLoadingMod,
    modType,
    isMapperNameVisiblePermitted,
    mapsWithTechInfo,
    colors,
}: MapsProps) => {
    //get common data
    const qualityQuery = api.quality.getAll.useQuery({}, { queryKey: ["quality.getAll", {}] });
    const qualities = qualityQuery.data ?? [];

    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];

    const lengthQuery = api.length.getAll.useQuery({}, { queryKey: ["length.getAll", {}] });
    const lengths = lengthQuery.data ?? [];


    //get ratings data
    const ratingQueries = api.useQueries(
        (useQueriesApi) => {
            if (isLoadingMod) return [];

            return mapsWithTechInfo.map(
                (mapWithTechInfo) => useQueriesApi.rating.getMapRatingData(
                    { mapId: mapWithTechInfo.id },
                    { queryKey: ["rating.getMapRatingData", { mapId: mapWithTechInfo.id }] },
                ),
            );
        },
    );

    const isLoadingRatings = isLoadingMod || ratingQueries.some((query) => query.isLoading);

    const ratingsFromMapIds = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings_maybeEmpty: MapRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings_maybeEmpty.push(rating);
        });

        if (!ratings_maybeEmpty.length) console.log(`ratings_maybeEmpty is empty. mapsWithTechInfo = "${mapsWithTechInfo}"`);

        return ratings_maybeEmpty;
    }, [isLoadingRatings, ratingQueries, mapsWithTechInfo]);  //TODO: figure out if mapsWithTechInfo can be removed from this dependency array


    //check that all data is loaded
    const isLoading = isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading || lengthQuery.isLoading;


    //get maps with quality, difficulty, and length names
    const mapsWithTechAndRatingInfo = useMemo(
        () => getMapsWithTechAndRatingInfo(isLoading, mapsWithTechInfo, ratingsFromMapIds, lengths, qualities, difficulties),
        [isLoading, mapsWithTechInfo, ratingsFromMapIds, qualities, difficulties, lengths],
    );

    return (
        <Stack align="center" justify="flex-start" spacing="0">
            <Title order={3}>Maps</Title>
            <MapsTable modType={modType} isMapperNameVisiblePermitted={isMapperNameVisiblePermitted} mapsWithTechAndRatingInfo={mapsWithTechAndRatingInfo} isLoading={isLoading} colors={colors} />
        </Stack>
    );
};
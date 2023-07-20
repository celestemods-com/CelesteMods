import { Box, Checkbox, Title, createStyles } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Difficulty, Length, Map, MapRatingData, MapYesRatingData, Quality } from "~/components/mods/types";
import { api } from "~/utils/api";
import { useEffect, useMemo, useState } from "react";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";




const useStyles = createStyles(
    (theme) => ({
        map: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xl}`
            },
        },
    }),
);




type MapWithInfo = {
    lengthName: string,
    overallCount: number,
    qualityName: string,
    qualityCount: number,
    difficultyName: string,
    difficultyCount: number,
} & Map;

export type MapsTableProps<
    IsNormalMod extends boolean,
    IsMapperNameVisible extends boolean,
> = {
    isLoadingMod: boolean;
    isNormalMod: IsNormalMod;
    isMapperNameVisible: IsMapperNameVisible;
    mapIds: number[];
};




const getMapsWithInfo = (isLoading: boolean, maps: Map[], ratingsFromMapIds: MapRatingData[], lengths: Length[], qualities: Quality[], difficulties: Difficulty[]): MapWithInfo[] => {
    if (isLoading) return [];


    const mapsWithInfo: MapWithInfo[] = maps.map((map) => {
        const rating = ratingsFromMapIds.find((rating) => rating.mapId === map.id);

        if (rating === undefined) throw `Map ${map.id} has an undefined rating - this should not happen.`;


        //get length info from map
        const length = lengths.find((length) => length.id === map.lengthId);

        if (!length) throw `Length ${map.lengthId}, linked to by map ${map.id}, not found. This should not happen.`;


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
            if (qualityCount === 0) throw `Quality count is 0 for map ${map.id} but qualityId is ${qualityId} (and not -1) - this should not happen.`;


            const quality = qualities.find((quality) => quality.id === qualityId);

            if (!quality) throw `Quality ${qualityId} not found. This should not happen.`;


            qualityName = quality.name;
        }


        if (difficultyId === -1) difficultyName = noRatingsFoundMessage;
        else {
            if (difficultyCount === 0) throw `Difficulty count is 0 for map ${map.id} but difficultyId is ${difficultyId} (and not -1) - this should not happen.`;


            const difficulty = difficulties.find((difficulty) => difficulty.id === difficultyId);

            if (!difficulty) throw `Difficulty ${difficultyId} not found. This should not happen.`;


            difficultyName = difficulty.name;
        }


        return {
            ...map,
            lengthName: length.name,
            overallCount,
            qualityName,
            qualityCount,
            difficultyName,
            difficultyCount,
        };
    });


    return mapsWithInfo;
};




const MapsTable = <
    IsNormalMod extends boolean,
    IsMapperNameVisible extends (
        IsNormalMod extends true ?
        false :
        boolean
    ),
>({
    isLoadingMod,
    isNormalMod,
    isMapperNameVisible: isMapperNameVisibleFromParent,
    mapIds,
}: MapsTableProps<IsNormalMod, IsMapperNameVisible>) => {
    //get common data
    const qualityQuery = api.quality.getAll.useQuery({}, { queryKey: ["quality.getAll", {}] });
    const qualities = qualityQuery.data ?? [];

    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];

    const lengthQuery = api.length.getAll.useQuery({}, { queryKey: ["length.getAll", {}] });
    const lengths = lengthQuery.data ?? [];


    //get maps data
    const mapsQueries = api.useQueries(
        (useQueriesApi) => mapIds.map(
            (id) => useQueriesApi.map.getById(
                { id },
                { queryKey: ["map.getById", { id, tableName: "Map" }] },
            ),
        ),
    );

    const isLoadingMaps = mapsQueries.some((query) => query.isLoading) || isLoadingMod;     //TODO!!: prove that this works

    const maps = useMemo(() => {
        if (isLoadingMaps) return [];


        const maps_maybeEmpty: Map[] = [];

        mapsQueries.forEach((mapQuery) => {
            const map = mapQuery.data;

            if (map) maps_maybeEmpty.push(map);
        });

        if (!maps_maybeEmpty.length) console.log(`maps_maybeEmpty is empty. mapIds = "${mapIds}"`);


        if (isNormalMod) return maps_maybeEmpty.sort((a, b) => a.name.localeCompare(b.name));

        return maps_maybeEmpty;
    }, [isLoadingMaps, mapsQueries, mapIds, isNormalMod]);


    //get ratings data
    const ratingQueries = api.useQueries(
        (useQueriesApi) => mapIds.map(
            (id) => useQueriesApi.rating.getMapRatingData(
                { mapId: id },
                { queryKey: ["rating.getMapRatingData", { mapId: id }] },
            ),
        ),
    );

    const isLoadingRatings = ratingQueries.some((query) => query.isLoading);

    const ratingsFromMapIds = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings: MapRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings.push(rating);
        });

        if (!ratings.length) console.log(`ratings_maybeEmpty is empty. mapIds = "${mapIds}"`);

        return ratings;
    }, [isLoadingRatings, ratingQueries, mapIds]);


    //check that all data is loaded
    const isLoading = isLoadingMaps || isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading || lengthQuery.isLoading;


    //get maps with quality, difficulty, and length names
    const mapsWithInfo = useMemo(() => getMapsWithInfo(isLoading, maps, ratingsFromMapIds, lengths, qualities, difficulties),
        [isLoading, maps, ratingsFromMapIds, qualities, difficulties, lengths]);


    //stuff //TODO!!: update this comment
    const [isMapperNameVisibleDisabled, setIsMapperNameVisibleDisabled] = useState<boolean>(false);
    const [isMapperNameVisible, setIsMapperNameVisible] = useState<boolean>();


    useEffect(
        () => setIsMapperNameVisible(isMapperNameVisibleFromParent),
        [isMapperNameVisibleFromParent],
    );


    useEffect(() => {
        if (isNormalMod && !isMapperNameVisibleDisabled) {
            setIsMapperNameVisible(false);
            setIsMapperNameVisibleDisabled(true);
        }
        else if (!isNormalMod && isMapperNameVisibleDisabled) {
            setIsMapperNameVisible(true);
            setIsMapperNameVisibleDisabled(false);
        }
    }, [isNormalMod]);


    //TODO!!!: continue here
    //finish mapsTable and test it with mapsTableTest (mapsTableTest is itself untested)
    //mapsTable should be able to be used in both /mods and /mods/[id]
    //show what's in the picture, plus the mapper name checkbox, the mapper name column (if on /mods/[id]), and a button for trigerring a "submit rating" popover



    const { cx, classes } = useStyles();

    return (
        <>
            <Box>
                <Title order={2}>Maps</Title>
                <Checkbox
                    label="Show mapper name"
                    size="sm"
                    disabled={isMapperNameVisibleDisabled}
                    checked={isMapperNameVisible}
                    onChange={(event) => setIsMapperNameVisible(event.currentTarget.checked)}
                />
            </Box>
            <DataTable
                className={classes.map}
                withBorder={false}
                fetching={isLoading}
                defaultColumnProps={{
                    sortable: !isNormalMod,
                    textAlignment: "center",
                }}
                records={[
                    ...mapsWithInfo,
                ]}
                columns={[
                    { accessor: "name", title: "Name" },
                    { accessor: "qualityName", title: "Quality" },
                    { accessor: "difficultyName", title: "Difficulty" },
                    { accessor: "lengthName", title: "Length" },
                    { accessor: "mapperNameString", title: "Mapper Name", hidden: !isMapperNameVisible }
                ]}
            />
        </>
    );
};


export default MapsTable;
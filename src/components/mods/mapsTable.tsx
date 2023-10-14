import { ActionIcon, Stack, Title, createStyles } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Difficulty, Length, Map, MapRatingData, MapYesRatingData, Quality } from "~/components/mods/types";
import { api } from "~/utils/api";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";
import { CirclePlus } from "tabler-icons-react";




const useStyles = createStyles(
    (theme) => ({
        map: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `0 ${theme.spacing.sm} ${theme.spacing.xl}`,
                backgroundColor: "#e1e1e2",
            },
        },
        columnTitle: {
            "&&": {
                fontWeight: "bold",
                backgroundColor: "#263972",
                color: "white",
                border: "none"
            }
        },
        leftColumnTitle: {
            "&&": {
                borderRadius: "20px 0 0 20px",
            }
        },
        rightColumnTitle: {
            "&&": {
                borderRadius: "0 20px 20px 0"
            }
        },
        columnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: "white",
                color: "black",
                borderLeft: "none",
                borderRight: "none",
                borderTop: "2px solid #263972",
                borderBottom: "2px solid #263972",
            }
        },
        leftColumnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: "white",
                color: "black",
                borderRadius: "20px 0 0 20px",
                border: "2px solid #263972",
                borderRight: "none",
            }
        },
        rightColumnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: "white",
                color: "black",
                borderRadius: "0 20px 20px 0",
                border: "2px solid #263972",
                borderLeft: "none",
            }
        }
    }),
);




type MapWithInfo = {
    lengthName: string,
    overallCount: number,
    qualityName: string,
    qualityCount: number,
    difficultyName: string,
    difficultyCount: number,
    chapterSide?: string;
} & Map;


type MapsTableSortStatus = {
    columnAccessor: keyof MapWithInfo;  //narrow from "typeof string"
} & DataTableSortStatus;


export type MapsTableProps = {
    isLoadingMod: boolean;
    isNormalMod: boolean;
    isMapperNameVisiblePermitted: boolean;
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


        const chapterSide = `${map.chapter ?? ""}${map.side ?? ""}`;


        return {
            ...map,
            lengthName: length.name,
            overallCount,
            qualityName,
            qualityCount,
            difficultyName,
            difficultyCount,
            chapterSide,
        };
    });


    return mapsWithInfo;
};




const getSortStatusFromIsNormalMod = (isNormalMod: boolean): MapsTableSortStatus => {
    if (isNormalMod) return {
        columnAccessor: "chapterSide",
        direction: "asc",
    };

    return {
        columnAccessor: "name",
        direction: "asc",
    };
};




const MapsTable = (
    {
        isLoadingMod,
        isNormalMod,
        isMapperNameVisiblePermitted,
        mapIds,
    }: MapsTableProps
) => {
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

    const isLoadingMaps = isLoadingMod || mapsQueries.some((query) => query.isLoading);     //TODO!!: prove that this works

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

    const isLoadingRatings = isLoadingMaps || ratingQueries.some((query) => query.isLoading);

    const ratingsFromMapIds = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings_maybeEmpty: MapRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings_maybeEmpty.push(rating);
        });

        if (!ratings_maybeEmpty.length) console.log(`ratings_maybeEmpty is empty. mapIds = "${mapIds}"`);

        return ratings_maybeEmpty;
    }, [isLoadingRatings, ratingQueries, mapIds]);  //TODO: figure out if mapIds can be removed from this dependency array


    //check that all data is loaded
    const isLoading = isLoadingMaps || isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading || lengthQuery.isLoading;


    //get maps with quality, difficulty, and length names
    const mapsWithInfo = useMemo(
        () => getMapsWithInfo(isLoading, maps, ratingsFromMapIds, lengths, qualities, difficulties),
        [isLoading, maps, ratingsFromMapIds, qualities, difficulties, lengths],
    );


    //handle sorting
    const [sortedMapsWithInfo, setSortedMapsWithInfo] = useState<MapWithInfo[]>(mapsWithInfo);


    const [sortStatus, setSortStatus] = useState<MapsTableSortStatus>(getSortStatusFromIsNormalMod(isNormalMod));


    useEffect(
        () => setSortStatus(getSortStatusFromIsNormalMod(isNormalMod)),
        [isNormalMod],
    );


    useEffect(() => {
        const sortedMaps = mapsWithInfo.sort(
            (a, b) => {
                const columnAccessor = sortStatus.columnAccessor;


                const propertyAString = String(a[columnAccessor]);
                const propertyBString = String(b[columnAccessor]);


                return (
                    sortStatus.direction === "asc" ?
                        propertyAString.localeCompare(propertyBString) :
                        propertyBString.localeCompare(propertyAString)
                );
            }
        );


        setSortedMapsWithInfo(sortedMaps);
    }, [isNormalMod, mapsWithInfo, sortStatus]);


    //handle mapper name visibility
    const [isMapperNameVisible, setIsMapperNameVisible] = useState(!isNormalMod && isMapperNameVisiblePermitted);

    useEffect(() => {
        if (isNormalMod || !isMapperNameVisiblePermitted) {
            setIsMapperNameVisible(false);
        }
        else {
            setIsMapperNameVisible(true);
        }
    }, [isNormalMod, isMapperNameVisiblePermitted]);


    //TODO!:
    //generalize mapsTable so it can be used in both /mods and /mods/[id]
    //add support for "nested sorting"
    //add filtering (at least by name)
    //pagination not needed in mapsTable (but is needed in the mods table on /mods)
    //use the datatable row context menu to allow for submitting ratings? or a row actions cell?


    const { cx, classes } = useStyles();

    return (
        <Stack align="center" justify="flex-start" spacing="0">
            <Title order={3}>Maps</Title>
            <DataTable
                textSelectionDisabled
                className={classes.map}
                fetching={isLoading}
                defaultColumnProps={{
                    sortable: !isNormalMod,
                    textAlignment: "center",
                    filtering: true,
                }}
                records={[...sortedMapsWithInfo,]}
                columns={[
                    {
                        accessor: "name",
                        title: "Name",
                        titleClassName: cx(classes.columnTitle, classes.leftColumnTitle),
                        cellsClassName: classes.leftColumnCells
                    },
                    {
                        accessor: "qualityName",
                        title: "Quality",
                        titleClassName: classes.columnTitle,
                        cellsClassName: classes.columnCells
                    },
                    {
                        accessor: "difficultyName",
                        title: "Difficulty",
                        titleClassName: classes.columnTitle,
                        cellsClassName: classes.columnCells
                    },
                    {
                        accessor: "lengthName",
                        title: "Length",
                        titleClassName: classes.columnTitle,
                        cellsClassName: classes.columnCells
                    },
                    {
                        accessor: "mapperNameString",
                        title: "Mapper Name",
                        hidden: !isMapperNameVisible,
                        titleClassName: classes.columnTitle,
                        cellsClassName: classes.columnCells
                    },
                    {
                        accessor: "rate",
                        title: "Rate",
                        render: (map) => (
                            <ActionIcon>
                                <CirclePlus color="black"/>
                            </ActionIcon>
                        ),
                        titleClassName: cx(classes.columnTitle, classes.rightColumnTitle),
                        cellsClassName: classes.rightColumnCells
                    }
                ]}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus as Dispatch<SetStateAction<DataTableSortStatus>>}     //un-narrow type to match types in DataTable
            />
        </Stack>
    );
};


export default MapsTable;
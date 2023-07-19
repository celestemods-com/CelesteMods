import { createStyles } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Map, MapRatingData } from "~/pages/mods/types";
import { api } from "~/utils/api";
import { useMemo } from "react";




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
    qualityName: string,
    difficultyName: string,
    lengthName: string,
} & Map;

type MapsTableProps = {
    isNormalMod: boolean,
    mapIds: [number, ...number[]];
};




const MapsTable = ({ isNormalMod, mapIds }: MapsTableProps) => {
    //get common data
    const qualityQuery = api.quality.getAll.useQuery({}, { queryKey: ["quality.getAll", {}] });
    const qualities = qualityQuery.data ?? [];

    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];

    const lengthQuery = api.length.getAll.useQuery({}, { queryKey: ["length.getAll", {}] });
    const lengths = lengthQuery.data ?? [];


    const mapsQueries = api.useQueries(
        (t) => mapIds.map(
            (id) => t.map.getById(
                { id },
                { queryKey: ["map.getById", { id, tableName: "Map" }] },
            ),
        ),
    );

    const isLoadingMaps = mapsQueries.some((query) => query.isLoading);

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


    const ratingQueries = api.useQueries(
        (t) => mapIds.map(
            (id) => t.rating.getMapRatingData(
                { mapId: id },
                { queryKey: ["rating.getMapRatingData", { mapId: id }] },
            ),
        ),
    );

    const isLoadingRatings = ratingQueries.some((query) => query.isLoading);

    const ratings = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings: MapRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings.push(rating);
        });

        if (!ratings.length) console.log(`ratings_maybeEmpty is empty. mapIds = "${mapIds}"`);

        return ratings;
    }, [isLoadingRatings, ratingQueries, mapIds]);


    const isLoading = isLoadingMaps || isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading || lengthQuery.isLoading;


    const mapsWithInfo = useMemo(() => {
        if (isLoading) return [];

        const mapsWithInfo: MapWithInfo[] = [];

        maps.forEach((map) => {
            const rating = ratings.find((rating) => rating.mapId === map.id);
            

            //TODO!!: continue here
        });

        return mapsWithInfo;
    }, [isLoading, maps, qualities, difficulties, lengths, ratingQueries]);


    const { cx, classes } = useStyles();

    return (
        <DataTable
            className={classes.map}
            withBorder={false}
            fetching={isLoading}
            defaultColumnProps={{
                sortable: !isNormalMod,
                textAlignment: "center",
            }}
            records={[
                ...maps,
            ]}
            columns={[
                { accessor: "name", title: "Name" },
                { accessor: "qualityName", title: "Quality" },
                { accessor: "difficultyName", title: "Difficulty" },
                { accessor: "lengthName", title: "Length" },
            ]}
        />
    );
};


export default MapsTable;
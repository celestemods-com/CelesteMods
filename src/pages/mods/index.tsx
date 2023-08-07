import { type NextPage } from "next";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles } from "@mantine/core";
import { Difficulty, Mod, ModRatingData, ModYesRatingData, Quality } from "~/components/mods/types";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";



const useStyles = createStyles(
    (theme) => ({
        modCell: {
            //double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                padding: `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.xl}`,
            },
        },
        expandedModCell: {
            "&&": {
                paddingBottom: 0,
            }
        }
    }),
);




type ModWithInfo = {
    mapsCount: number;
    overallCount: number;
    qualityName: string;
    qualityCount: number;
    difficultyName: string;
    difficultyCount: number;
} & Mod;


type ModsTableSortStatus = {
    columnAccesspor: keyof ModWithInfo; //narrow from "typeof string"
} & DataTableSortStatus;




const getModWithInfo = (isLoading: boolean, mods: Mod[], ratingsFromModIds: ModRatingData[], qualities: Quality[], difficulties: Difficulty[]): ModWithInfo[] => {
    if (isLoading) return [];


    const modsWithInfo: ModWithInfo[] = mods.map((mod) => {
        const rating = ratingsFromModIds.find((rating) => rating.modId === mod.id);

        if (rating === undefined) throw `Mod ${mod.id} has an undefined rating - this should not happen.`;

        
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
            const narrowedRating = rating as ModYesRatingData;

            overallCount = narrowedRating.overallCount;
            qualityCount = narrowedRating.qualityCount;
            difficultyCount = narrowedRating.difficultyCount;

            if (narrowedRating.averageQualityId) qualityId = narrowedRating.averageQualityId;

            if (narrowedRating.averageDifficultyId) difficultyId = narrowedRating.averageDifficultyId;
        }


        if (qualityId === -1) qualityName = noRatingsFoundMessage;
        else {
            if (qualityCount === 0) throw `Quality count is 0 for mod ${mod.id} but qualityId is ${qualityId} (and not -1) - this should not happen.`;


            const quality = qualities.find((quality) => quality.id === qualityId);

            if (!quality) throw `Quality ${qualityId} not found. This should not happen.`;


            qualityName = quality.name;
        }


        if (difficultyId === -1) difficultyName = noRatingsFoundMessage;
        else {
            if (difficultyCount === 0) throw `Difficulty count is 0 for mod ${mod.id} but difficultyId is ${difficultyId} (and not -1) - this should not happen.`;


            const difficulty = difficulties.find((difficulty) => difficulty.id === difficultyId);

            if (!difficulty) throw `Difficulty ${difficultyId} not found. This should not happen.`;


            difficultyName = difficulty.name;
        }


        return {
            ...mod,
            mapsCount: mod.Map.length,
            overallCount,
            qualityName,
            qualityCount,
            difficultyName,
            difficultyCount,
        };
    });


    return modsWithInfo;
};




const Mods: NextPage = () => {
    //get common data
    const qualityQuery = api.quality.getAll.useQuery({}, { queryKey: ["quality.getAll", {}] });
    const qualities = qualityQuery.data ?? [];

    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];


    //get mod ids
    const modIdsQuery = api.mod.getIds.useQuery({}, { queryKey: ["mod.getIds", {}] });

    const isLoadingModIds = modIdsQuery.isLoading;

    const modIds = useMemo(() => {
        if (isLoadingModIds) return [];


        const modIds_maybeEmpty: number[] = modIdsQuery.data ?? [];

        if (!modIds_maybeEmpty.length) console.log(`modIds_maybeEmpty is empty. modIds = "${modIds}"`);


        return modIds_maybeEmpty;
    }, [isLoadingModIds, modIdsQuery.data]);


    //get mods data
    const modsQueries = api.useQueries(
        (useQueriesApi) => modIds.map(
            (id) => useQueriesApi.mod.getById(
                {
                    id,
                    tableName: "Mod",
                },
                {
                    queryKey: [
                        "mod.getById",
                        { id, tableName: "Mod" },
                    ],
                },
            ),
        ),
    );

    const isLoadingMods = isLoadingModIds || modsQueries.some((query) => query.isLoading);

    const mods = useMemo(() => {
        if (isLoadingMods) return [];


        const mods_maybeEmpty: Mod[] = [];

        modsQueries.forEach((modQuery) => {
            if (!modQuery.data) return;

            const mod = {
                ...modQuery.data,
                isExpanded: false,
            } as Mod;   //TODO!: prove this cast is safe

            if (mod) mods_maybeEmpty.push(mod);
        });

        if (!mods_maybeEmpty.length) console.log(`mods_maybeEmpty is empty. modIds = "${modIds}"`);


        return mods_maybeEmpty;
    }, [isLoadingMods, modsQueries]);


    //get ratings data
    const ratingQueries = api.useQueries(
        (useQueriesApi) => modIds.map(
            (id) => useQueriesApi.rating.getModRatingData(
                { modId: id },
                { queryKey: ["rating.getModRatingData", { modId: id }] },
            ),
        ),
    );

    const isLoadingRatings = isLoadingModIds || ratingQueries.some((query) => query.isLoading);

    const ratingsFromModIds = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings_maybeEmpty: ModRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings_maybeEmpty.push(rating);
        });

        if (!ratings_maybeEmpty.length) console.log(`ratings_maybeEmpty is empty. modIds = "${modIds}"`);

        return ratings_maybeEmpty;
    }, [isLoadingRatings, ratingQueries, modIds]);  //TODO: figure out if modIds can be removed from this dependency array


    //check that all data is loaded
    const isLoading = isLoadingModIds || isLoadingMods || isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading;


    //get mods with map count and quality and difficulty names
    const modsWithInfo = useMemo(
        () => getModWithInfo(isLoading, mods, ratingsFromModIds, qualities, difficulties),
        [isLoading, mods, ratingsFromModIds, qualities, difficulties],
    );




    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>(modsWithInfo.map((expandedRow) => expandedRow.id));


    const { cx, classes } = useStyles();

    return (
        <>
            <PageHeader title="Mods" />
            <DataTable
                defaultColumnProps={{
                    cellsClassName: (record) => {
                        return cx(
                            classes.modCell,
                            record.isExpanded && classes.expandedModCell,
                        );
                    },
                }}
                withBorder
                borderRadius={"sm"}
                striped
                textSelectionDisabled
                withColumnBorders
                highlightOnHover
                fetching={isLoading}
                records={modsWithInfo.map(      //TODO!!: move this function out of the return statement
                    (mod) => {
                        return ({
                            ...mod,
                            isExpanded: expandedRowIds.some(
                                (id) => id === mod.id,
                            ),
                        });
                    },
                )}
                idAccessor={(record) => record.id}
                columns={[
                    { accessor: "name", title: "Name", sortable: true },
                    { accessor: "mapsCount", title: "# Maps", sortable: true },
                    { accessor: "type", title: "Type", sortable: true },
                    { accessor: "qualityName", title: "Quality", sortable: true },
                    { accessor: "difficultyName", title: "Difficulty", sortable: true },
                ]}
                rowExpansion={{
                    trigger: "click",
                    allowMultiple: false,
                    expanded: {
                        recordIds: expandedRowIds,
                        onRecordIdsChange: setExpandedRowsIds,
                    },
                    content: ({ record }) => {
                        return (
                            <ExpandedMod
                                isLoading={isLoading}
                                mod={record}
                            />
                        );
                    }
                }}
            />
        </>
    );
};

export default Mods;
import { type NextPage } from "next";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles } from "@mantine/core";
import { Difficulty, Mod, ModRatingData, ModYesRatingData, Quality } from "~/components/mods/types";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";

//TODO!: add styling, page header, and search/filtering




const PAGE_SIZES = [5, 10, 15, 20, 25, 50, 100, 250, 500, 1000];
const DEFAULT_PAGE_SIZE_INDEX = 1;




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
    columnAccessor: keyof ModWithInfo; //narrow from "typeof string"
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

    /*
        //get all mod ids   //not using pagination because backend pagination is awkward with mantine-datatable
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
        */

    const modsQuery = api.mod.getAll.useQuery({}, { queryKey: ["mod.getAll", {}] });

    const isLoadingMods = modsQuery.isLoading;

    const mods = useMemo(() => {
        if (isLoadingMods || !modsQuery.data || !modsQuery.data.length) return [];


        const mods_maybeEmpty: Mod[] = [];

        modsQuery.data.forEach((mod) => {
            const modWithIsExpanded = {
                ...mod,
                isExpanded: false,
            };   //TODO!: prove this cast is safe

            mods_maybeEmpty.push(modWithIsExpanded);
        });

        if (!mods_maybeEmpty.length) console.log(`mods_maybeEmpty is empty.`);


        return mods_maybeEmpty;
    }, [isLoadingMods, modsQuery.data]);


    //get ratings data
    const ratingQueries = api.useQueries(
        (useQueriesApi) => mods.map(
            (mod) => useQueriesApi.rating.getModRatingData(
                { modId: mod.id },
                { queryKey: ["rating.getModRatingData", { modId: mod.id }] },
            ),
        ),
    );

    const isLoadingRatings = isLoadingMods || ratingQueries.some((query) => query.isLoading);

    const ratingsFromModIds = useMemo(() => {
        if (isLoadingRatings) return [];

        const ratings_maybeEmpty: ModRatingData[] = [];

        ratingQueries.forEach((ratingQuery) => {
            const rating = ratingQuery.data;

            if (rating !== undefined) ratings_maybeEmpty.push(rating);
        });

        if (!ratings_maybeEmpty.length) console.log(`ratings_maybeEmpty is empty. mods = "${JSON.stringify(mods)}"`);

        return ratings_maybeEmpty;
    }, [isLoadingRatings, ratingQueries, /*modIds,*/ mods]);  //TODO: figure out if modIds/mods can be removed from this dependency array


    //check that all data is loaded
    const isLoading = isLoadingMods || isLoadingRatings || qualityQuery.isLoading || difficultyQuery.isLoading;


    //get mods with map count, and quality and difficulty names
    const [modsWithInfo, setModsWithInfo] = useState<ModWithInfo[]>(getModWithInfo(isLoading, mods, ratingsFromModIds, qualities, difficulties));

    useEffect(() => {
        const newModsWithInfo = getModWithInfo(isLoading, mods, ratingsFromModIds, qualities, difficulties);

        setModsWithInfo(newModsWithInfo);
    }, [isLoading, mods, ratingsFromModIds, qualities, difficulties]);




    //handle sorting
    const [sortedModsWithInfo, setSortedModsWithInfo] = useState<ModWithInfo[]>(modsWithInfo);

    const [sortStatus, setSortStatus] = useState<ModsTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    useEffect(() => {
        const columnAccessor = sortStatus.columnAccessor;

        if (columnAccessor === "mapsCount") {
            setSortedModsWithInfo(
                modsWithInfo.sort(
                    (a, b) => {
                        const propertyANum = Number(a[columnAccessor]);
                        const propertyBNum = Number(b[columnAccessor]);

                        const aIsNan = isNaN(propertyANum);
                        const bIsNan = isNaN(propertyBNum);

                        if (aIsNan && bIsNan) return 0;
                        if (aIsNan) return -1;
                        if (bIsNan) return 1;


                        return (
                            sortStatus.direction === "asc" ?
                                propertyANum - propertyBNum :
                                propertyBNum - propertyANum
                        );
                    },
                ),
            );
        } else if (columnAccessor === "qualityName") {
            setSortedModsWithInfo(
                modsWithInfo.sort(
                    (a, b) => {
                        if (a === b) return 0;

                        const aQuality = qualities.find((quality) => quality.name === a.qualityName);
                        const bQuality = qualities.find((quality) => quality.name === b.qualityName);

                        if (!aQuality && !bQuality) return 0;
                        if (!aQuality) return 1;
                        if (!bQuality) return -1;

                        return (
                            sortStatus.direction === "asc" ?
                                bQuality.order - aQuality.order :   //b-a because better qualities have higher orders, but we want them to sort first when ascending
                                aQuality.order - bQuality.order
                        );
                    },
                ),
            );
        } else if (columnAccessor === "difficultyName") {
            setSortedModsWithInfo(
                modsWithInfo.sort(
                    (a, b) => {
                        if (a === b) return 0;

                        const aDifficulty = difficulties.find((difficulty) => difficulty.name === a.difficultyName);
                        const bDifficulty = difficulties.find((difficulty) => difficulty.name === b.difficultyName);

                        if (!aDifficulty && !bDifficulty) return 0;
                        if (!aDifficulty) return 1;
                        if (!bDifficulty) return -1;

                        return (
                            sortStatus.direction === "asc" ?
                                aDifficulty.order - bDifficulty.order :
                                bDifficulty.order - aDifficulty.order
                        );
                    },
                ),
            );
        } else {
            setSortedModsWithInfo(
                modsWithInfo.sort(
                    (a, b) => {
                        const propertyAString = String(a[columnAccessor]);
                        const propertyBString = String(b[columnAccessor]);


                        return (
                            sortStatus.direction === "asc" ?
                                propertyAString.localeCompare(propertyBString) :
                                propertyBString.localeCompare(propertyAString)
                        );
                    },
                ),
            );
        }
    }, [modsWithInfo, sortStatus]);


    //handle row expansion
    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>([]);
    const [sortedModsWithIsExpanded, setSortedModsWithIsExpanded] = useState<ModWithInfo[]>(modsWithInfo);

    useEffect(() => {
        if (!sortedModsWithInfo.length) return;


        const modsWithExpansion = sortedModsWithInfo.map(
            (mod) => {
                return ({
                    ...mod,
                    isExpanded: expandedRowIds.some(
                        (id) => id === mod.id,
                    ),
                });
            },
        );


        setSortedModsWithIsExpanded(modsWithExpansion);
    }, [sortedModsWithInfo, expandedRowIds]);


    //handle pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[DEFAULT_PAGE_SIZE_INDEX] ?? 10);

    //reset page when sortStatus or page size changes
    useEffect(() => {
        setPage(1);
    }, [sortStatus, pageSize]);

    //handle providing datatable with correct subset of data
    const [records, setRecords] = useState<ModWithInfo[]>(sortedModsWithIsExpanded.slice(0, pageSize));

    useEffect(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const newRecords = sortedModsWithIsExpanded.slice(startIndex, endIndex);

        setRecords(newRecords);
    }, [page, pageSize, sortedModsWithIsExpanded]);


    //reset expanded rows when sortStatus, page, or page size changes
    useEffect(() => {
        setExpandedRowsIds([]);
    }, [sortStatus, page, pageSize]);


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
                records={records}
                idAccessor={(record) => record.id}
                columns={[
                    { accessor: "name", title: "Name", sortable: true },
                    { accessor: "mapsCount", title: "# Maps", sortable: true },
                    { accessor: "type", title: "Type", sortable: true },
                    { accessor: "qualityName", title: "Quality", sortable: true },
                    { accessor: "difficultyName", title: "Difficulty", sortable: true },
                ]}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus as Dispatch<SetStateAction<DataTableSortStatus>>}     //un-narrow type to match types in DataTable
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
                totalRecords={sortedModsWithIsExpanded.length}
                recordsPerPage={pageSize}
                page={page}
                onPageChange={setPage}
                recordsPerPageOptions={PAGE_SIZES}
                onRecordsPerPageChange={setPageSize}
            />
        </>
    );
};

export default Mods;
import { type NextPage } from "next";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles, MultiSelect, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Difficulty, Mod, ModRatingData, ModYesRatingData, Quality } from "~/components/mods/types";
import { noRatingsFoundMessage } from "~/consts/noRatingsFoundMessage";
import { modTypes } from "~/components/mods/consts";
import { type ModType } from "@prisma/client";
import StringSearch from "~/components/filterPopovers/stringSearch";
import NumberSearch from "~/components/filterPopovers/numberSearch";
import { Layout } from "~/components/layout/layout";




const PAGE_SIZES = [5, 10, 15, 20, 25, 50, 100, 250, 500, 1000];
const DEFAULT_PAGE_SIZE_INDEX = 1;




const useStyles = createStyles(
    (theme) => ({
        pageTitle: {
            color: "white",
            fontSize: "35px",
            textAlign: "center",
        },
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




type RatingInfo = {
    id: number;
    name: string;
    count: number;
};


type ModWithInfo = {

    overallCount: number;
    Quality: RatingInfo;
    Difficulty: RatingInfo;
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


            let quality = qualities.find((quality) => quality.id === qualityId);

            if (quality?.order === 1) quality = qualities.find((quality) => quality.order = 2);     //prevent mods from actually showing up as "Not Recommended"    //TODO: add minimum threshold below which the mod isn't displayed at all

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
            overallCount,
            Quality: {
                id: qualityId,
                name: qualityName,
                count: qualityCount,
            },
            Difficulty: {
                id: difficultyId,
                name: difficultyName,
                count: difficultyCount,
            },
        };
    });


    return modsWithInfo;
};




const Mods: NextPage = () => {
    //get common data
    const qualityQuery = api.quality.getAll.useQuery({}, { queryKey: ["quality.getAll", {}] });
    const qualities = qualityQuery.data ?? [];

    const qualityNames = useMemo(
        () => qualities
            .sort((a, b) => b.order - a.order)  //better qualities have higher orders, so we want them to sort first
            .map((quality) => quality.name),
        [qualities],
    );


    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];

    const difficultyNames = useMemo(
        () => difficulties
            .sort((a, b) => a.order - b.order)  //easier difficulties have lower orders, and we want them to sort first
            .map((difficulty) => difficulty.name),
        [difficulties],
    );

    /*
        //get all mod ids   //not using pagination because backend pagination is awkward with mantine-datatable     //TODO: implement this
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




    //handle filtering
    const [nameQuery, setNameQuery] = useState<string>("");
    const [debouncedNameQuery, cancelDebouncedNameQueryChange] = useDebouncedValue(nameQuery, 200);

    const [mapCountRange, setMapCountRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);     //[min, max]
    const [selectedModTypes, setSelectedModTypes] = useState<ModType[]>([]);
    const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

    const [filteredModsWithInfo, setFilteredModsWithInfo] = useState<ModWithInfo[]>(modsWithInfo);

    useEffect(() => {
        setFilteredModsWithInfo(
            modsWithInfo.filter((modWithInfo) => {
                if (
                    debouncedNameQuery &&
                    !modWithInfo.name.toLowerCase().includes(debouncedNameQuery.trim().toLowerCase())
                ) {
                    return false;
                }


                if (
                    mapCountRange[0] !== undefined ||
                    mapCountRange[1] !== undefined
                ) {
                    if (
                        mapCountRange[0] !== undefined &&
                        modWithInfo.Map.length < mapCountRange[0]
                    ) {
                        return false;
                    }

                    if (
                        mapCountRange[1] !== undefined &&
                        modWithInfo.Map.length > mapCountRange[1]
                    ) {
                        return false;
                    }
                }


                if (
                    selectedModTypes.length &&
                    !selectedModTypes.includes(modWithInfo.type)
                ) {
                    return false;
                }


                if (
                    selectedQualities.length &&
                    !selectedQualities.includes(modWithInfo.Quality.name)
                ) {
                    return false;
                }


                if (
                    selectedDifficulties.length &&
                    !selectedDifficulties.includes(modWithInfo.Difficulty.name)
                ) {
                    return false;
                }


                return true;
            }),
        );
    }, [modsWithInfo, debouncedNameQuery, mapCountRange, selectedModTypes, selectedQualities, selectedDifficulties]);




    //handle sorting
    const [sortedModsWithInfo, setSortedModsWithInfo] = useState<ModWithInfo[]>(filteredModsWithInfo);

    const [sortStatus, setSortStatus] = useState<ModsTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    useEffect(() => {
        const columnAccessor = sortStatus.columnAccessor;

        if (columnAccessor === "Map") {
            setSortedModsWithInfo(
                filteredModsWithInfo.sort(
                    (a, b) => {
                        const propertyANum = Number(a.Map.length);
                        const propertyBNum = Number(b.Map.length);

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
        } else if (columnAccessor === "Quality") {
            setSortedModsWithInfo(
                filteredModsWithInfo.sort(
                    (a, b) => {
                        if (a === b) return 0;

                        const aQuality = qualities.find((quality) => quality.name === a.Quality.name);
                        const bQuality = qualities.find((quality) => quality.name === b.Quality.name);

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
        } else if (columnAccessor === "Difficulty") {
            setSortedModsWithInfo(
                filteredModsWithInfo.sort(
                    (a, b) => {
                        if (a === b) return 0;

                        const aDifficulty = difficulties.find((difficulty) => difficulty.name === a.Difficulty.name);
                        const bDifficulty = difficulties.find((difficulty) => difficulty.name === b.Difficulty.name);

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
                filteredModsWithInfo.sort(
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
    }, [filteredModsWithInfo, sortStatus]);




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
    }, [sortStatus, pageSize, debouncedNameQuery, mapCountRange, selectedModTypes, selectedQualities, selectedDifficulties]);

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
        <Layout pageTitle="Mods" pageDescription="Mods" pathname="/mods">
            <Title className={classes.pageTitle} order={2}>Mods List</Title>
            <DataTable
                defaultColumnProps={{
                    cellsClassName: (record) => {
                        return cx(
                            classes.modCell,
                            record.isExpanded && classes.expandedModCell,
                        );
                    },
                }}
                height={550}
                withBorder
                borderRadius={"sm"}
                striped
                textSelectionDisabled
                withColumnBorders
                highlightOnHover
                fetching={isLoading}
                records={records}
                idAccessor={(record) => record.id}
                columns={[      //TODO!!!: add filtering. create searchString, searchRange, and searchSet components to use here.
                    {
                        accessor: "name",
                        title: "Name",
                        sortable: true,
                        filter: (
                            <StringSearch
                                value={nameQuery}
                                setValue={setNameQuery}
                                label="Name"
                                description="Show mods whose names include the specified text"
                                placeholder="Search names..."
                            />
                        ),
                        filtering: nameQuery !== "",
                    },
                    {
                        accessor: "Map",
                        title: "# Maps",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Map.length,
                        filter: (
                            <NumberSearch
                                range={mapCountRange}
                                setRange={setMapCountRange}
                                maxProps={{
                                    label: "Map Count",
                                    description: "Maximum",
                                    placeholder: "Set maximum..."
                                }}
                                minProps={{
                                    description: "Minimum",
                                    placeholder: "Set minimum..."
                                }}
                            />
                        ),
                        filtering: mapCountRange[0] !== undefined || mapCountRange[1] !== undefined,
                    },
                    {
                        accessor: "type",
                        title: "Type",
                        sortable: true,
                        filter: (
                            <div
                                
                            />
                        ),
                        filtering: !!selectedModTypes.length,
                    },
                    {
                        accessor: "Quality",
                        title: "Quality",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Quality.name,
                        filter: (
                            <div
                                
                            />
                        ),
                        filtering: !!selectedQualities.length,
                    },
                    {
                        accessor: "Difficulty",
                        title: "Difficulty",
                        sortable: true,
                        render: (modWithInfo) => modWithInfo.Difficulty.name,
                        filter: (
                            <div
                                
                            />
                        ),
                        filtering: !!selectedDifficulties.length,
                    },
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
        </Layout>
    );
};

export default Mods;

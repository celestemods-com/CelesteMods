import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Difficulty, Quality } from "~/components/mods/types";
import { type ModType, ModType as modTypes } from "@prisma/client";
import { StringSearch } from "~/components/filterPopovers/stringSearch";
import { NumberSearch } from "~/components/filterPopovers/numberSearch";
import { ListSelect } from "~/components/filterPopovers/listSelect";
import { getNonEmptyArray } from "~/utils/getNonEmptyArray";
import type { ModWithInfo } from "~/components/mods/types";




const PAGE_SIZES = [5, 10, 15, 20, 25, 50, 100, 250, 500, 1000];
const DEFAULT_PAGE_SIZE_INDEX = 1;



const useStyles = createStyles(
    (theme) => ({
        table: {
            "&&&& table": {
                borderSpacing: "0 20px",
                padding: "0 15px"
            },
            "&&&& tr": {
                backgroundColor: "transparent",
            },
            "&&&& table + div": {
                // Removes the shadow below the table header
                display: "none",
            }
        },
        modCell: {
            //4 ampersands to increase selectivity of class to ensure it overrides any other css
            "&&&&": {
                /* top | left and right | bottom */
                padding: `${theme.spacing.sm} ${theme.spacing.xl} ${theme.spacing.sm}`,
                backgroundColor: "#e1e1e2",
                color: theme.black,
                borderWidth: 0,
                fontWeight: "bold",
            },
        },
        expandedModCell: {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
        },
        columnHeader: {
            "&&": {
                backgroundColor: "#263972",
                fontWeight: "bold",
                color: theme.white,
                fontSize: "17px",
                padding: "10px",
                textAlign: "center",
            }
        },
        leftColumnCell: {
            borderTopLeftRadius: "50px",
            borderBottomLeftRadius: "50px",
        },
        rightColumnCell: {
            borderTopRightRadius: "50px",
            borderBottomRightRadius: "50px",
        },
        pagination: {
            backgroundColor: "#263972",
        }
    }),
);




type ModsTableSortStatus = {
    columnAccessor: keyof ModWithInfo; //narrow from "typeof string"
} & DataTableSortStatus;


type ModsTableProps = {
    qualities: Quality[];
    difficulties: Difficulty[];
    modsWithInfo: ModWithInfo[];
    isLoading: boolean;
};




// We create a seperate ModsTable component to prevent the Mods queries
// running again when the ModsTable state changes.
export const ModsTable = ({ qualities, difficulties, modsWithInfo, isLoading }: ModsTableProps) => {
    const qualityNames = useMemo(   //get quality names for filter component
        () => [...qualities]
            .sort((a, b) => b.order - a.order)  //better qualities have higher orders, so we want them to sort first
            .map((quality) => quality.name)
            .slice(0, -1),  //remove "Not Recommended" from the selectable list, as no mods will ever publicly show as "Not Recommended"
        [qualities],
    );


    const parentDifficultyNames = useMemo(  //get parent difficulty names for filter component
        () => difficulties
            .filter((difficulty) => difficulty.parentDifficultyId === 0)    //parent difficulties all have the nullParent difficulty, with id = 0, as their parent
            .sort((a, b) => a.order - b.order)  //easier difficulties have lower orders, and we want them to sort first
            .map((difficulty) => difficulty.name),
        [difficulties],
    );




    //handle filtering
    const [nameQuery, setNameQuery] = useState<string>("");
    const [debouncedNameQuery, cancelDebouncedNameQueryChange] = useDebouncedValue(nameQuery, 200);

    const [mapCountRange, setMapCountRange] = useState<[number | undefined, number | undefined]>([undefined, undefined]);     //[min, max]
    const [selectedModTypes, setSelectedModTypes] = useState<ModType[]>([]);
    const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
    const [selectedParentDifficulties, setSelectedParentDifficulties] = useState<string[]>([]);

    const filteredModsWithInfo = useMemo(() => {
        return modsWithInfo.filter((modWithInfo) => {
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
                selectedParentDifficulties.length &&
                !selectedParentDifficulties.some((parentDifficulty) => modWithInfo.Difficulty.name.startsWith(parentDifficulty))
            ) {
                return false;
            }


            return true;
        });
    }, [modsWithInfo, debouncedNameQuery, mapCountRange, selectedModTypes, selectedQualities, selectedParentDifficulties]);




    //handle sorting
    const [sortStatus, setSortStatus] = useState<ModsTableSortStatus>({
        columnAccessor: "name",
        direction: "asc",
    });

    const sortedModsWithInfo = useMemo(() => {
        const columnAccessor = sortStatus.columnAccessor;

        const sortedModsWithInfo = [...filteredModsWithInfo];

        if (columnAccessor === "Map") {
            sortedModsWithInfo.sort(
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
            );
        } else if (columnAccessor === "Quality") {
            sortedModsWithInfo.sort(
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
            );
        } else if (columnAccessor === "Difficulty") {
            sortedModsWithInfo.sort(
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
            );
        } else {
            sortedModsWithInfo.sort(
                (a, b) => {
                    const propertyAString = String(a[columnAccessor]);
                    const propertyBString = String(b[columnAccessor]);

                    return (
                        sortStatus.direction === "asc" ?
                            propertyAString.localeCompare(propertyBString) :
                            propertyBString.localeCompare(propertyAString)
                    );
                },
            );
        }

        return sortedModsWithInfo;
    }, [filteredModsWithInfo, sortStatus, qualities, difficulties]);




    //handle row expansion
    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>([]);
    const sortedModsWithIsExpanded = useMemo(() => {
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

        return modsWithExpansion;
    }, [sortedModsWithInfo, expandedRowIds]);




    //handle pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[DEFAULT_PAGE_SIZE_INDEX] ?? 10);

    //reset page when sortStatus or page size changes
    useEffect(() => {
        setPage(1);
    }, [sortStatus, pageSize, debouncedNameQuery, mapCountRange, selectedModTypes, selectedQualities, selectedParentDifficulties]);

    //handle providing datatable with correct subset of data
    // const [records, setRecords] = useState<ModWithInfo[]>(sortedModsWithIsExpanded.slice(0, pageSize));

    const records = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const newRecords = sortedModsWithIsExpanded.slice(startIndex, endIndex);

        return newRecords;
    }, [page, pageSize, sortedModsWithIsExpanded]);




    //reset expanded rows when sortStatus, page, or page size changes
    useEffect(() => {
        // If expandedRowIds is already empty, we return it instead of a new array
        // to prevent the sortedModsWithIsExpanded memo function from running again.
        setExpandedRowsIds(expandedRowIds => expandedRowIds.length === 0 ? expandedRowIds : []);
    }, [sortStatus, page, pageSize]);




    const { cx, classes } = useStyles();

    return (
        <DataTable
            classNames={{ root: classes.table, pagination: classes.pagination }}
            defaultColumnProps={{
                cellsClassName: (record) => {
                    return cx(
                        classes.modCell,
                        record.isExpanded && classes.expandedModCell,
                    );
                },
            }}
            height={550}
            striped
            textSelectionDisabled
            withColumnBorders
            highlightOnHover
            fetching={isLoading}
            records={records}
            idAccessor={(record) => record.id}
            columns={[
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
                    titleClassName: classes.columnHeader,
                    cellsClassName: (record) => {
                        return cx(
                            classes.modCell,
                            classes.leftColumnCell,
                            record.isExpanded && classes.expandedModCell,
                        );
                    },
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
                    titleClassName: classes.columnHeader,
                },
                {
                    accessor: "type",
                    title: "Type",
                    sortable: true,
                    filter: (
                        <ListSelect
                            permittedStrings={getNonEmptyArray(modTypes)}
                            selectedStrings={selectedModTypes}
                            setSelectedStrings={setSelectedModTypes}
                        />
                    ),
                    filtering: !!selectedModTypes.length,
                    titleClassName: classes.columnHeader,
                },
                {
                    accessor: "Quality",
                    title: "Quality",
                    sortable: true,
                    render: (modWithInfo) => modWithInfo.Quality.name,
                    filter: (
                        <ListSelect
                            permittedStrings={qualityNames}
                            selectedStrings={selectedQualities}
                            setSelectedStrings={setSelectedQualities}
                        />
                    ),
                    filtering: !!selectedQualities.length,
                    titleClassName: classes.columnHeader,
                },
                {
                    accessor: "Difficulty",
                    title: "Difficulty",
                    sortable: true,
                    render: (modWithInfo) => modWithInfo.Difficulty.name,
                    filter: (
                        <ListSelect
                            permittedStrings={parentDifficultyNames}
                            selectedStrings={selectedParentDifficulties}
                            setSelectedStrings={setSelectedParentDifficulties}
                        />
                    ),
                    filtering: !!selectedParentDifficulties.length,
                    titleClassName: classes.columnHeader,
                    cellsClassName: (record) => {
                        return cx(
                            classes.modCell,
                            classes.rightColumnCell,
                            record.isExpanded && classes.expandedModCell,
                        );
                    },
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
    );
};
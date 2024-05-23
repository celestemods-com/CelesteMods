import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActionIcon, Text, createStyles } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import type { MapWithTechAndRatingInfo, Mod } from "~/components/mods/types";
import { CirclePlus } from "tabler-icons-react";
import { ModsTableTooltip } from "../modsTableTooltip";
import { expandedModColors } from "~/styles/expandedModColors";
import { TABLE_HEADER_ARROW_ZOOM } from "~/consts/tableHeaderArrowZoom";
import type { DifficultyColor } from "~/styles/difficultyColors";
import { getOrdinal } from "~/utils/getOrdinal";
import { COMING_SOON_PATHNAME } from "~/consts/pathnames";
import { truncateString } from "~/utils/truncateString";




const NAME_COLUMN_MAX_LETTERS = 20;
const MAPPER_NAME_COLUMN_MAX_LETTERS = 20;




const useStyles = createStyles(
    (
        theme,
        { colors }: { colors: DifficultyColor; },
    ) => ({
        mapTable: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `0 ${theme.spacing.sm} ${theme.spacing.xl}`,
                backgroundColor: expandedModColors.default.backgroundColor,
            },
            "&&&&&& table": {
                borderSpacing: "0 8px",
                // Border spacing adds space before the header, so we move the table up
                transform: 'translate(0, -8px)',
                "tbody": {
                    transform: 'translate(0, 3px)',
                },
            },
            "&&&&&& thead": {
                top: "0",
            },
            "&&&& th": {
                fontWeight: "bold",
                border: "none",
                backgroundColor: colors.primary.backgroundColor,
                color: colors.primary.textColor,
                // The down arrow appears blurry due to rotation, so we zoom in to fix that.
                // https://stackoverflow.com/a/53556981
                ".mantine-Center-root": {
                    zoom: TABLE_HEADER_ARROW_ZOOM,
                },
                "svg": {
                    color: colors.primary.textColor,
                },
            },
            "&&&& th:hover": {
                backgroundColor: colors.primaryHover.backgroundColor,
                color: colors.primaryHover.textColor,
                "svg": {
                    color: colors.primaryHover.textColor,
                },
            },
        },
        leftColumnTitle: {
            "&&": {
                borderRadius: "20px 0 0 20px",
            },
        },
        rightColumnTitle: {
            "&&": {
                borderRadius: "0 20px 20px 0"
            },
        },
        columnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: theme.white,
                color: theme.black,
                borderLeft: "none",
                borderRight: "none",
                borderTop: "2px solid",
                borderBottom: "2px solid",
                borderColor: colors.primary.backgroundColor,
            },
        },
        leftColumnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: theme.white,
                color: theme.black,
                borderRadius: "20px 0 0 20px",
                border: "2px solid",
                borderColor: colors.primary.backgroundColor,
                borderRight: "none",
            },
        },
        rightColumnCells: {
            "&&&&": {
                fontWeight: "bold",
                backgroundColor: theme.white,
                color: theme.black,
                borderRadius: "0 20px 20px 0",
                border: "2px solid",
                borderColor: colors.primary.backgroundColor,
                borderLeft: "none",
            },
        },
    }),
);




type MapsTableSortStatus = {
    columnAccessor: keyof MapWithTechAndRatingInfo;  //narrow from "typeof string"
} & DataTableSortStatus;


export type MapsTableProps = {
    modType: Mod["type"];
    isMapperNameVisiblePermitted: boolean;
    mapsWithTechAndRatingInfo: MapWithTechAndRatingInfo[];
    isLoading: boolean;
    colors: DifficultyColor;
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




export const MapsTable = (
    {
        modType,
        isMapperNameVisiblePermitted,
        mapsWithTechAndRatingInfo,
        isLoading,
        colors,
    }: MapsTableProps
) => {
    const isNormalMod = modType === "Normal";


    //handle sorting
    const [sortStatus, setSortStatus] = useState<MapsTableSortStatus>(getSortStatusFromIsNormalMod(isNormalMod));

    useEffect(
        () => setSortStatus(getSortStatusFromIsNormalMod(isNormalMod)),
        [isNormalMod],
    );

    const sortedMapsWithInfo = useMemo(() => {
        const sortedMaps = [...mapsWithTechAndRatingInfo].sort(
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


        return sortedMaps;
    }, [mapsWithTechAndRatingInfo, sortStatus]);


    //handle mapper name visibility
    const isMapperNameVisible = !isNormalMod && isMapperNameVisiblePermitted;


    const { classes } = useStyles({ colors });

    return (
        <DataTable
            textSelectionDisabled
            className={classes.mapTable}
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
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => {
                        const TARGET_LABEL = "Map";

                        const { name, chapterSide, overallRank } = mapWithTechAndRatingInfo;


                        let dropdownLabel: string | undefined = undefined;
                        let dropdownText: string | undefined = undefined;

                        if (modType === "Normal") {
                            if (chapterSide === undefined) throw `chapterSide is undefined for map ${mapWithTechAndRatingInfo.id} in a Normal mod.`;

                            dropdownLabel = "Level";
                            dropdownText = chapterSide;
                        } else if (modType === "Contest") {
                            dropdownLabel = "Place";

                            if (overallRank === null) {
                                dropdownText = "N/A";
                            } else {
                                dropdownText = getOrdinal(overallRank, false);
                            }
                        }



                        return (
                            dropdownText === undefined ? (
                                name.length > NAME_COLUMN_MAX_LETTERS ? (
                                    <ModsTableTooltip
                                        prefixDropdownWithTarget
                                        targetStrings={{
                                            label: TARGET_LABEL,
                                            text: truncateString(name, NAME_COLUMN_MAX_LETTERS),
                                            textForDropdown: name,
                                            addPeriodToText: false,
                                        }}
                                        dropdownStrings={{
                                            label: "",
                                            text: "",
                                            addPeriodToText: false,
                                        }}
                                    />
                                ) : (
                                    <Text
                                        size="sm"
                                    >
                                        {name}
                                    </Text>
                                )
                            ) : (
                                <ModsTableTooltip
                                    prefixDropdownWithTarget
                                    targetStrings={{
                                        label: TARGET_LABEL,
                                        text: truncateString(name, NAME_COLUMN_MAX_LETTERS),
                                        textForDropdown: name,
                                        addPeriodToText: false,
                                    }}
                                    dropdownStrings={{
                                        label: dropdownLabel,
                                        text: dropdownText,
                                        addPeriodToText: false,
                                    }}
                                />
                            )
                        );
                    },
                    titleClassName: classes.leftColumnTitle,
                    cellsClassName: classes.leftColumnCells,
                },
                {
                    accessor: "qualityName",
                    title: "Quality",
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => {
                        if (mapWithTechAndRatingInfo.qualityCount === 0) return (
                            <Text
                                size="sm"
                            >
                                {mapWithTechAndRatingInfo.qualityName}
                            </Text>
                        );

                        return (
                            <ModsTableTooltip
                                prefixDropdownWithTarget
                                targetStrings={{
                                    label: "Quality",
                                    text: mapWithTechAndRatingInfo.qualityName,
                                    textForDropdown: `${mapWithTechAndRatingInfo.qualityName}. Based on ${mapWithTechAndRatingInfo.qualityCount} ratings.`,
                                    addPeriodToText: false,
                                }}
                                dropdownStrings={{
                                    label: "Description",
                                    text: mapWithTechAndRatingInfo.qualityDescription,
                                    addPeriodToText: false,
                                }}
                            />
                        );
                    },
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "difficultyName",
                    title: "Difficulty",
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => {
                        const difficultyNameFromMap = mapWithTechAndRatingInfo.difficultyName;


                        if (mapWithTechAndRatingInfo.difficultyCount === 0) return (
                            <Text
                                size="sm"
                            >
                                {difficultyNameFromMap}
                            </Text>
                        );


                        const [parentDifficultyName, childDifficultyName] = difficultyNameFromMap.split(": ");

                        if (parentDifficultyName === undefined || childDifficultyName === undefined) return "";

                        return (
                            <ModsTableTooltip
                                prefixDropdownWithTarget
                                targetStrings={{
                                    label: "Difficulty",
                                    text: `${childDifficultyName} ${parentDifficultyName}`,
                                    addPeriodToText: {
                                        dropdown: true,
                                        target: false,
                                    },
                                }}
                                dropdownStrings={{
                                    text: `Based on ${mapWithTechAndRatingInfo.difficultyCount} ratings.`,
                                    addPeriodToText: false,
                                }}
                            />
                        );
                    },
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "lengthName",
                    title: "Length",
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => (
                        <ModsTableTooltip
                            prefixDropdownWithTarget
                            targetStrings={{
                                label: "Length",
                                text: mapWithTechAndRatingInfo.lengthName,
                                addPeriodToText: false,
                            }}
                            dropdownStrings={{
                                label: "Description",
                                text: mapWithTechAndRatingInfo.lengthDescription,
                                addPeriodToText: false,
                            }}
                        />
                    ),
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "mapperNameString",
                    title: "Mapper Name",
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => (
                        <ModsTableTooltip
                            prefixDropdownWithTarget
                            targetStrings={{
                                label: "Mapper",
                                text: truncateString(mapWithTechAndRatingInfo.mapperNameString, MAPPER_NAME_COLUMN_MAX_LETTERS),
                                textForDropdown: mapWithTechAndRatingInfo.mapperNameString,
                                addPeriodToText: false,
                            }}
                            dropdownStrings={{
                                text: "",
                                addPeriodToText: false,
                            }}
                        />
                    ),
                    hidden: !isMapperNameVisible,
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "rate",
                    title: "Rate",
                    ellipsis: true,
                    render: (_mapWithTechAndRatingInfo) => (
                        <ModsTableTooltip
                            dropdownStrings={{
                                text: "Rate this map!",
                                addPeriodToText: false,
                            }}
                            childComponent={(
                                <Link
                                    href={COMING_SOON_PATHNAME}
                                >
                                    <ActionIcon
                                        aria-label="Rate this map"
                                    >
                                        <CirclePlus
                                            color="black"
                                        />
                                    </ActionIcon>
                                </Link>
                            )}
                        />

                    ),
                    titleClassName: classes.rightColumnTitle,
                    cellsClassName: classes.rightColumnCells,
                },
            ]}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus as Dispatch<SetStateAction<DataTableSortStatus>>}     //un-narrow type to match types in DataTable
        />
    );
};
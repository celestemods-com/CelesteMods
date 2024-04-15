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
                borderSpacing: "0 20px",
                // Border spacing adds space before the header, so we move the table up
                transform: 'translate(0, -20px)',
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
                        const { name, chapterSide, overallRank } = mapWithTechAndRatingInfo;


                        let dropdownBaseString: string | undefined = undefined;

                        if (modType === "Normal") {
                            if (chapterSide === undefined) throw `chapterSide is undefined for map ${mapWithTechAndRatingInfo.id} in a Normal mod.`;

                            dropdownBaseString = chapterSide;
                        } else if (modType === "Contest") {
                            if (overallRank === null) dropdownBaseString = "";
                            else dropdownBaseString = getOrdinal(overallRank, false);
                        }


                        return (
                            dropdownBaseString === undefined ? (
                                <Text
                                    size="sm"
                                >
                                    {name}
                                </Text>
                            ) : (
                                <ModsTableTooltip
                                    targetString={name}
                                    dropdownString={
                                        dropdownBaseString === "" ?
                                            name :
                                            `${name}: ${dropdownBaseString} Place`
                                    }
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
                                targetString={mapWithTechAndRatingInfo.qualityName}
                                dropdownString={`${mapWithTechAndRatingInfo.qualityName}: ${mapWithTechAndRatingInfo.qualityCount} ratings`}
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

                        let difficultyStringForDisplay: string;
                        if (mapWithTechAndRatingInfo.difficultyCount === 0) {
                            difficultyStringForDisplay = mapWithTechAndRatingInfo.difficultyName;
                        } else {
                            const [parentDifficulty, childDifficulty] = difficultyNameFromMap.split(": ");

                            if (parentDifficulty === undefined || childDifficulty === undefined) return "";

                            difficultyStringForDisplay = `${childDifficulty} ${parentDifficulty}`;
                        }


                        if (mapWithTechAndRatingInfo.difficultyCount === 0) return (
                            <Text
                                size="sm"
                            >
                                {mapWithTechAndRatingInfo.difficultyName}
                            </Text>
                        );

                        return (
                            <ModsTableTooltip
                                targetString={difficultyStringForDisplay}
                                dropdownString={`${difficultyStringForDisplay}: ${mapWithTechAndRatingInfo.difficultyCount} ratings`}
                            />
                        );
                    },
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "lengthName",
                    title: "Length",
                    ellipsis: true,
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "mapperNameString",
                    title: "Mapper Name",
                    ellipsis: true,
                    render: (mapWithTechAndRatingInfo) => (
                        <ModsTableTooltip
                            targetString={mapWithTechAndRatingInfo.mapperNameString}
                            dropdownString={mapWithTechAndRatingInfo.mapperNameString}
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
                            dropdownString="Rate this map"
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
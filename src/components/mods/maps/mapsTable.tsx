import { ActionIcon, createStyles } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import type { Map } from "~/components/mods/types";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { CirclePlus } from "tabler-icons-react";
import { expandedModColors } from "~/styles/expandedModColors";
import { TABLE_HEADER_ARROW_ZOOM } from "~/consts/tableHeaderArrowZoom";
import type { DifficultyColor } from "~/styles/difficultyColors";




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
            "&&&& table": {
                borderSpacing: "0 20px",
                // Border spacing adds space before the header, so we move the table up
                transform: 'translate(0, -20px)',
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
    isNormalMod: boolean;
    isMapperNameVisiblePermitted: boolean;
    mapsWithInfo: MapWithInfo[];
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
        isNormalMod,
        isMapperNameVisiblePermitted,
        mapsWithInfo,
        isLoading,
        colors,
    }: MapsTableProps
) => {
    //handle sorting
    const [sortStatus, setSortStatus] = useState<MapsTableSortStatus>(getSortStatusFromIsNormalMod(isNormalMod));

    useEffect(
        () => setSortStatus(getSortStatusFromIsNormalMod(isNormalMod)),
        [isNormalMod],
    );

    const sortedMapsWithInfo = useMemo(() => {
        const sortedMaps = [...mapsWithInfo].sort(
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
    }, [mapsWithInfo, sortStatus]);


    //handle mapper name visibility
    const isMapperNameVisible = !isNormalMod && isMapperNameVisiblePermitted;


    const { cx, classes } = useStyles({ colors });

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
                    titleClassName: classes.leftColumnTitle,
                    cellsClassName: classes.leftColumnCells,
                },
                {
                    accessor: "qualityName",
                    title: "Quality",
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "difficultyName",
                    title: "Difficulty",
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "lengthName",
                    title: "Length",
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "mapperNameString",
                    title: "Mapper Name",
                    hidden: !isMapperNameVisible,
                    cellsClassName: classes.columnCells,
                },
                {
                    accessor: "rate",
                    title: "Rate",
                    render: (_) => (
                        <ActionIcon>
                            <CirclePlus color="black" />
                        </ActionIcon>
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
import { ActionIcon, createStyles } from "@mantine/core";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { type Map } from "~/components/mods/types";
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { CirclePlus } from "tabler-icons-react";




const useStyles = createStyles(
    (theme) => ({
        mapTable: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `0 ${theme.spacing.sm} ${theme.spacing.xl}`,
                backgroundColor: "#e1e1e2",
            },
            "&&&& table": {
                borderSpacing: "0 20px",
                // Border spacing adds space before the header, so we move the table up
                transform: 'translate(0, -20px)',
            }
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
    isNormalMod: boolean;
    isMapperNameVisiblePermitted: boolean;
    mapsWithInfo: MapWithInfo[];
    isLoading: boolean;
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
        isNormalMod,
        isMapperNameVisiblePermitted,
        mapsWithInfo,
        isLoading,
    }: MapsTableProps
) => {
    const [sortStatus, setSortStatus] = useState<MapsTableSortStatus>(getSortStatusFromIsNormalMod(isNormalMod));


    useEffect(
        () => setSortStatus(getSortStatusFromIsNormalMod(isNormalMod)),
        [isNormalMod],
    );

    //handle sorting
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


    //TODO!:
    //generalize mapsTable so it can be used in both /mods and /mods/[id]
    //add support for "nested sorting"
    //add filtering (at least by name)
    //pagination not needed in mapsTable (but is needed in the mods table on /mods)
    //use the datatable row context menu to allow for submitting ratings? or a row actions cell?


    const { cx, classes } = useStyles();

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
                    render: (_) => (
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
    );
};

export default MapsTable;
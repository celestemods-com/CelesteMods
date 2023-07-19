import { type NextPage } from "next";
import { DataTable } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { useMemo, useState } from "react";
import ExpandedDifficulty from "~/components/difficulties/expandedDifficulty";
import { createStyles } from "@mantine/core";




const useStyles = createStyles(
    (theme) => ({
        difficultyCell: {
            //double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                padding: `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.xl}`,
            },
        },
        expandedDifficultyCell: {
            "&&": {
                paddingBottom: 0,
            }
        }
    }),
);




export type Difficulty = RouterOutputs["difficulty"]["getById"];


type SortedDifficulty = {
    parent: Difficulty;
    children: Difficulty[];
};




const Difficulties: NextPage = () => {
    const difficultyQuery = api.difficulty.getAll.useQuery({}, { queryKey: ["difficulty.getAll", {}] });
    const difficulties = difficultyQuery.data ?? [];


    const sortedDifficulties = useMemo(() => {
        const parentDifficulties = difficulties.filter(
            ({ parentDifficultyId }) => parentDifficultyId === 0,
        ).sort();


        return parentDifficulties.map(
            (parentDifficulty) => {
                if (parentDifficulty.parentDifficultyId !== 0) throw "Parent difficulty parentDifficultyId must be 0";


                const childDifficultiesArray = difficulties.filter(
                    ({ parentDifficultyId }) => parentDifficultyId === parentDifficulty.id,
                ).sort();


                return {
                    parent: parentDifficulty,
                    children: childDifficultiesArray,
                };
            }
        );
    }, [difficulties]);


    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>(sortedDifficulties.map((expandedRow) => expandedRow.parent.id));



    const { cx, classes } = useStyles();

    return (
        <>
            <PageHeader title="Difficulties" />
            <DataTable
                defaultColumnProps={{
                    cellsClassName: (record) => {
                        return cx(
                            classes.difficultyCell,
                            record.isExpanded && classes.expandedDifficultyCell,
                        );
                    },
                }}
                withBorder
                borderRadius={"sm"}
                striped
                withColumnBorders
                highlightOnHover
                fetching={difficultyQuery.isLoading}
                records={sortedDifficulties.map(
                    (sortedDifficulty) => {
                        return ({
                            ...sortedDifficulty.parent,
                            isExpanded: expandedRowIds.some(
                                (id) => id === sortedDifficulty.parent.id,
                            ),
                        });
                    },
                )}
                idAccessor={(record) => record.id}
                columns={[
                    { accessor: "name", title: "Name", sortable: true },
                    { accessor: "description", title: "Description", sortable: true },
                    { accessor: "order", title: "Order", sortable: true },
                ]}
                rowExpansion={{
                    trigger: "click",
                    allowMultiple: true,
                    expanded: {
                        recordIds: expandedRowIds,
                        onRecordIdsChange: setExpandedRowsIds,
                    },
                    content: ({ record }) => {
                        const childDifficulties = sortedDifficulties.find(({ parent }) => parent.id === record.id)?.children;

                        if (!childDifficulties) return null;


                        return (
                            <ExpandedDifficulty
                                isLoading={difficultyQuery.isLoading}
                                isExpanded={record.isExpanded}
                                subDifficulties={childDifficulties}
                            />
                        );
                    }
                }}
            />
        </>
    );
};

export default Difficulties;
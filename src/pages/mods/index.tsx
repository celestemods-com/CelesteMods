import { type NextPage } from "next";
import { DataTable } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { useMemo, useState } from "react";
import ExpandedMod from "~/components/mods/expandedMod";
import { createStyles } from "@mantine/core";



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





const Mods: NextPage = () => {
    const modQuery = api.mod.getAll.useQuery({}, { queryKey: ["mod.getAll", {}] });     //TODO!: refactor this to use findMany or to query by id
    const mods = modQuery.data ?? [];


    const [expandedRowIds, setExpandedRowsIds] = useState<number[]>(mods.map((expandedRow) => expandedRow.id));



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
                fetching={modQuery.isLoading}
                records={mods.map(
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
                    { accessor: "description", title: "Description", sortable: true },
                    { accessor: "order", title: "Order", sortable: true },
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
                                isLoading={modQuery.isLoading}
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
import { createStyles } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Difficulty } from "~/pages/difficulties";




const useStyles = createStyles(
    (theme) => ({
        subDifficulty: {
            // double ampersand to increase selectivity of class to ensure it overrides any other css
            "&&": {
                /* top | left and right | bottom */
                margin: `${theme.spacing.xs} ${theme.spacing.sm} ${theme.spacing.xl}`
            },
        },
    }),
);




type SubDifficultiesProps = {
    isLoading: boolean;
    isExpanded: boolean;
    subDifficulties: Difficulty[];
};



export default function SubDifficulties({ isLoading, isExpanded, subDifficulties }: SubDifficultiesProps) {
    const { cx, classes } = useStyles();
    return (
        <DataTable
            className={cx(isExpanded && classes.subDifficulty)}
            withBorder
            borderRadius={"lg"}
            striped
            withColumnBorders
            highlightOnHover
            fetching={isLoading}
            records={[
                ...subDifficulties,
                // {
                //     name: "extraDifficulty",
                //     description: "description",
                //     order: 99,
                // },
            ]}
            columns={[
                { accessor: "name", title: "Name", sortable: true },
                { accessor: "description", title: "Description", sortable: true },
                { accessor: "order", title: "Order", sortable: true },
            ]}
        />
    );
};
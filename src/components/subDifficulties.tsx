import { DataTable } from "mantine-datatable";
import { Difficulty } from "~/pages/difficulties";
import { RouterOutputs } from "~/utils/api";




type SubDifficultiesProps = {
    isLoading: boolean;
    subDifficulties: Difficulty[];
};



export default function SubDifficulties({ isLoading, subDifficulties }: SubDifficultiesProps) {
    return (
        <DataTable
            withBorder
            borderRadius={"lg"}
            striped
            withColumnBorders
            highlightOnHover
            fetching={isLoading}
            records={subDifficulties}
            columns={[
                { accessor: "name", title: "Name", sortable: true },
                { accessor: "description", title: "Description", sortable: true },
                { accessor: "order", title: "Order", sortable: true },
            ]}
        />
    );
};
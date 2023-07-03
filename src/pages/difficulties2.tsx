import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useDebouncedState } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { useState } from "react";




const Difficulties: NextPage = () => {
    const [searchValue, setSearchValue] = useDebouncedState("", 100);


    const { query } = useRouter();
    const urlDifficultyId = Number(query.id);

    const [initialDifficultyId] = useState(isNaN(urlDifficultyId) ? undefined : urlDifficultyId);   //TODO: find out if useState is needed, or if urlDifficultyId can be used directly

    const [expandedRowDifficultyIds, setExpandedRowDifficultyIds] = useState(initialDifficultyId ? [initialDifficultyId] : []);


    const difficultyQuery = api.difficulty.getAll.useQuery({});
    const difficulties = difficultyQuery.data ?? [];


    return (
        <>
            <PageHeader title="Difficulties" value={searchValue} setValue={setSearchValue} />
            <DataTable
                withBorder
                borderRadius={"sm"}
                striped
                withColumnBorders
                highlightOnHover
                fetching={difficultyQuery.isLoading}
                records={difficulties}
                columns={[
                    {accessor: "name", title: "Name", sortable: true},
                    {accessor: "description", title: "Description", sortable: true},
                    {accessor: "order", title: "Order", sortable: true},
                ]}
            />
        </>
    );
};

export default Difficulties;
import { type NextPage } from "next";
import { DataTable } from "mantine-datatable";
import { RouterOutputs, api } from "~/utils/api";
import PageHeader from "~/components/pageHeader";
import { useMemo, useState } from "react";
import SubDifficulties from "~/components/subDifficulties";




export type Difficulty = RouterOutputs["difficulty"]["getById"];




const Difficulties: NextPage = () => {
    const difficultyQuery = api.difficulty.getAll.useQuery({});
    const difficulties = difficultyQuery.data ?? [];


    const parentDifficulties = difficulties.filter(
        ({ parentDifficultyId }) => parentDifficultyId === 0,
    ).sort();


    const sortedDifficulties = parentDifficulties.map(
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


    return (
        <>
            <PageHeader title="Difficulties" />
            <DataTable
                withBorder
                borderRadius={"sm"}
                striped
                withColumnBorders
                highlightOnHover
                fetching={difficultyQuery.isLoading}
                records={parentDifficulties}
                columns={[
                    { accessor: "name", title: "Name", sortable: true },
                    { accessor: "description", title: "Description", sortable: true },
                    { accessor: "order", title: "Order", sortable: true },
                ]}
                rowExpansion={{
                    trigger: "always",
                    allowMultiple: true,
                    content: ({ record }) => {
                        const childDifficulties = sortedDifficulties.find(({ parent }) => parent.id === record.id)?.children;

                        if (!childDifficulties) return null;

                        
                        return (
                            <SubDifficulties
                                isLoading={difficultyQuery.isLoading}
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
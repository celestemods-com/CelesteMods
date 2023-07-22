import { useEffect, useState } from "react";
import MapsTable from "~/components/mods/mapsTable";
import { api } from "~/utils/api";
import { Mod } from "../mods/types";
import { Box, Button, Checkbox, Group, TextInput } from "@mantine/core";




const MapsTableTest = () => {
    const [isNormalMod, setIsNormalMod] = useState(false);


    const [modId, setModId] = useState<number>(1);

    const [mapIds, setMapIds] = useState<number[]>([]);


    const [isLoadingNewMod, setIsLoadingNewMod] = useState<boolean>(true);

    const modQuery = api.mod.getById.useQuery({ id: modId }, { queryKey: ["mod.getById", { id: modId }] });


    useEffect(() => {
        if (modQuery.isLoading !== isLoadingNewMod) setIsLoadingNewMod(modQuery.isLoading);
    }, [modQuery.isLoading]);


    const mod = modQuery.data as Mod ?? null;


    useEffect(() => {
        if (!mod) return;

        const mapIds = mod.Map.map((map) => map.id);

        setMapIds(mapIds);


        const newIsNormalMod = mod.type === "Normal";

        if (isNormalMod !== newIsNormalMod) setIsNormalMod(newIsNormalMod);
    }, [mod]);


    const [textInputValue, setTextInputValue] = useState(modId);


    return (
        <>
            <Group position="center">
                <Checkbox
                    description="isNormalMod"
                    checked={isNormalMod}
                    onChange={(event) => setIsNormalMod(event.currentTarget.checked)}
                />
                <Group position="center">
                    <TextInput
                        label="modId"
                        value={textInputValue}
                        onChange={(event) => setTextInputValue(Number(event.currentTarget.value))}
                    />
                    <Button
                        size="md"
                        type="submit"
                        variant="outline"
                        loading={isLoadingNewMod}
                        onClick={() => {
                            if (isNaN(textInputValue)) return;

                            setModId(textInputValue);
                        }}
                    >
                        Update modId
                    </Button>
                </Group>
            </Group>
            <MapsTable
                isLoadingMod={modQuery.isLoading}
                isNormalMod={isNormalMod}
                mapIds={mapIds}
            />
        </>
    );
};


export default MapsTableTest;
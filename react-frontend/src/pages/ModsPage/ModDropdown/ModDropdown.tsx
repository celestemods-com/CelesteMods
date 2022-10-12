import { Group, Stack, Image } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Carousel } from "@mantine/carousel";
import { useAppDispatch, useAppSelector } from "../../../reduxApp/hooks";
import { RootState } from "../../../reduxApp/store";
import { ModDropdownHeader } from "./ModDropdownHeader";
import { useEffect, useMemo } from "react";
import { selectMapsByModID } from "../../../features/mods_maps_publishers/maps/mapsSlice";
import { mapsSubTableColumnNames } from "../../../features/mods_maps_publishers/maps/mapsSliceConstants";


export const ModDropdown = ({ modID }: { modID: number }) => {
    const maps = useAppSelector((rootState: RootState) => selectMapsByModID(rootState, modID));

    const flattenedMaps = useMemo(() => {
        return maps.map((map) => {
            return Array.isArray(map) ? map[0] : map;
        });
    }, [maps]);

    const imageUrlsArray = ["https://i.imgur.com/sJQR1GY.jpeg", "https://i.imgur.com/knaf4bQ.jpeg"];    //TODO: get images from gamebanana


    const mapsTable = DataTable({
        withBorder: true,
        borderRadius: "sm",
        striped: true,
        withColumnBorders: true,
        highlightOnHover: true,
        records: flattenedMaps,
        columns: [
            {
                accessor: mapsSubTableColumnNames[0].jsName,
                title: mapsSubTableColumnNames[0].headerName,
                sortable: true,
            },
            {
                accessor: `${mapsSubTableColumnNames[1].jsName}.${mapsSubTableColumnNames[1].entries[0].jsName}`,
                title: mapsSubTableColumnNames[1].entries[0].headerName,
                sortable: true,
            },
            {
                accessor: `${mapsSubTableColumnNames[1].jsName}.${mapsSubTableColumnNames[1].entries[1].jsName}`,
                title: mapsSubTableColumnNames[1].entries[1].headerName,
                sortable: true,
            },
            {
                accessor: mapsSubTableColumnNames[2].jsName,
                title: mapsSubTableColumnNames[2].headerName,
                sortable: true,
            },
            {
                accessor: mapsSubTableColumnNames[3].jsName,
                title: mapsSubTableColumnNames[3].headerName,
                sortable: true,
            },
        ],
        //onRowClick: (record) => {},   //TODO: generate Modal on click
    });


    if (imageUrlsArray.length) {
        return (
            <Stack>
                <ModDropdownHeader modID={modID} />
                <Group>
                    <Carousel>
                        {imageUrlsArray.map((url) => {
                            return (
                                <Carousel.Slide key={url}>
                                    <Image src={url} />
                                </Carousel.Slide>
                            );
                        })}
                    </Carousel>
                    {mapsTable}
                </Group>
            </Stack>
        );
    }
    else {
        return (
            <Stack>
                <ModDropdownHeader modID={modID} />
                {mapsTable}
            </Stack>
        )
    }
}
import { Group, Stack, Image } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { Carousel } from "@mantine/carousel";
import { useAppDispatch, useAppSelector } from "../../../reduxApp/hooks";
import { RootState } from "../../../reduxApp/store";
import { ModDropdownHeader } from "./ModDropdownHeader";
import { useEffect, useMemo } from "react";
import { selectMapsForTableByModID } from "../../../features/mods_maps_publishers/maps/mapsSlice";
import { mapsSubTableColumnNames } from "../../../features/mods_maps_publishers/maps/mapsSliceConstants";
import { fetchImageUrlsByModID, selectImageUrlsByModID } from "../../../features/mods_maps_publishers/mods/modsSlice";


export const ModDropdown = ({ modID, gamebananaModID }: { modID: number, gamebananaModID: number }) => {
    const dispatch = useAppDispatch();
    const imageUrlsArray = useAppSelector((rootState: RootState) => selectImageUrlsByModID(rootState, modID));
    const maps = useAppSelector((rootState: RootState) => selectMapsForTableByModID(rootState, modID));

    const flattenedMaps = useMemo(() => {
        return maps.map((map) => {
            return Array.isArray(map) ? map[0] : map;
        });
    }, [maps]);


    useEffect(() => {
        dispatch(fetchImageUrlsByModID({ modID, gamebananaModID }));
    }, [dispatch, modID]);


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
    });


    //const stackParameters = {};

    if (imageUrlsArray.length) {
        return (
            <Stack>
                <ModDropdownHeader modID={modID} />
                <Group spacing={"lg"} position={"center"} noWrap align={"start"} grow>
                    <Carousel>
                        {imageUrlsArray.map((url) => {
                            return (
                                <Carousel.Slide key={url} sx={{maxHeight: 350, maxWidth: 400}}>
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
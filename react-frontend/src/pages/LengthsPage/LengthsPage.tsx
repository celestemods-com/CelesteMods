import { useAppDispatch, useAppSelector } from "../../reduxApp/hooks";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../reduxApp/store";
import { fetchMods } from "../../features/mods_maps_publishers/mods/modsSlice";
import { Stack } from "@mantine/core";




export const LengthsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    useEffect(() => {

    }, [dispatch]);


    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchMods(false));
        }, 10 * 60 * 1000);     //refresh the mods state every 10 minutes

        return () => clearInterval(interval);


        //TODO: figure out if adding dispatch as a dependency really matters, and, if it does, find out if it could cause memory leaks here
        // eslint-disable-next-line
    }, []);




    return (
        <Stack justify={"flex-start"} align={"center"} spacing={"md"}>

        </Stack>
    );
}
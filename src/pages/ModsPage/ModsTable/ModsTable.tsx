import { useAppSelector, useAppDispatch } from "../../../reduxApp/hooks";

import { selectModsForTable, fetchMods } from "../../../features/mods/modsSlice";
import { useEffect } from "react";

import { ModsTableHeader } from "./components/ModsTableHeader";
import { ModTableItems } from "./components/ModTableItems";

//TODO: implement sorting by column




export function ModsTable() {
    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(fetchMods(true));
    }, [dispatch]);


    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchMods(false));
        }, 10 * 60 * 1000);     //refresh the mods state every 10 minutes

        return () => clearInterval(interval);


        //TODO: figure out if adding dispatch as a dependency really matters, and, if it does, find out if it could cause memory leaks here
        // eslint-disable-next-line
    }, []);



    const modStates = useAppSelector(selectModsForTable);


    if (!modStates || !modStates.length) {
        return (
            <div>
                Waiting for mods to fetch
            </div>
        )
    }


    return (
        <div className="table table__mods">
            <ModsTableHeader />
            <ModTableItems />
        </div>
    );
}
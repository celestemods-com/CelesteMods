import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../reduxApp/hooks";

import { selectModsForTable, fetchMods } from "../../../features/mods/modsSlice";

import { ModsTableHeader } from "./components/ModsTableHeader";
import { ModTableItems } from "./components/ModTableItems";

//TODO: implement sorting by column




export function ModsTable() {
    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(fetchMods());
    }, [dispatch]);



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
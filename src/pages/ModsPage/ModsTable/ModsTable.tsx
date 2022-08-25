import { useEffect } from "react";
import { selectModsForTable, fetchMods } from "../../../features/mods/modsSlice";
import { useSelector, useDispatch } from "react-redux";
import ModsTableHeader from "./components/ModsTableHeader";
import ModTableItems from "./components/ModTableItems";

//TODO: implement sorting by column




export default function ModsTable() {
    const dispatch = useDispatch();


    useEffect(() => {//@ts-ignore
        dispatch(fetchMods());
    }, [dispatch]);



    const modStates = useSelector(selectModsForTable);


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
import { useEffect, useState } from "react";
import "./ModsPage.scss";
import { useSelector, useDispatch } from "react-redux";
import { fetchMods, selectModsForTable } from "../../features/mods/modsSlice";
import ModsTable from "./components/ModsTable";




export default function ModsPage() {
    const storedModsForTable = useSelector(selectModsForTable);
    const [modsForTable, setModsForTable] = useState(storedModsForTable ? storedModsForTable : null);

    useEffect(() => {
        setModsForTable(storedModsForTable);
    }, [storedModsForTable]);


    const dispatch = useDispatch();

    useEffect(() => {//@ts-ignore
        dispatch(fetchMods());
    }, [dispatch]);



    try {
        return (
            <div>
                <header className="header">
                    <div className="header__column  header__column-left" />
                    <div className="header__column  header__column-center">
                        <h1 className="page__title">
                            Mods
                        </h1>
                    </div>
                    <div className="header__column header__column-right">
                        <p className="search">
                            Search for mods
                        </p>
                    </div>
                </header>
                {ModsTable(modsForTable)}
            </div>
        );
    }
    catch (error) {
        return (
            <div>
                Something Broke
            </div>
        );
    }
}
import "../ModsPage.scss";
import { useSelector } from "react-redux";
import { isModForTable__singleEntry, modForTable, selectModsForTable } from "../../../features/mods/modsSlice";




export default function ModsTable(modsForTable: modForTable[] | null) {
    if (!modsForTable || !modsForTable.length) {
        return (
            <div>
                Waiting for mods to fetch
            </div>
        )
    }

    
    const firstMod = modsForTable[0];


    return (
        <div className="table table__mods">
            <div className="table__header">
                {firstMod.entries.map((entry) => {
                    if (isModForTable__singleEntry(entry)) {
                        return (
                            <h2 key={entry.cssName} className={`table__header-item mod-column__${entry.cssName}`}>
                                {entry.headerName}
                            </h2>
                        );
                    }
                    else {
                        return (
                            <div key={entry.name} className="table__multi-column">
                                <h2 className="table__header-item table__multi-column-title">
                                    {entry.name}
                                </h2>
                                <div className="table__multi-column__columns">
                                    {entry.entries.map((entry_inner) => {
                                        return (
                                            <h3 key={entry_inner.cssName} className={`table__header-item table__multi-column__columns-title mod-column__${entry_inner.cssName}`}>
                                                {entry_inner.headerName}
                                            </h3>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
            <div className="table__items">
                {modsForTable.map((modForTable) => {
                    return (
                        <div key={modForTable.id.toString()} className="table__item table__mods-mod">
                            {modForTable.entries.map((entry) => {
                                if (isModForTable__singleEntry(entry)) {
                                    return (
                                        <div key={entry.cssName} className={`table__item-column mod-column${entry.cssName}`}>
                                            {entry.value}
                                        </div>
                                    )
                                }
                                else {
                                    return (
                                        <div key={entry.name} className="table__multi-column">
                                            {entry.entries.map((entry_inner) => {
                                                return (
                                                    <div key={entry_inner.cssName} className={`table__item-column mod-column${entry_inner.cssName}`}>
                                                        {entry_inner.value}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
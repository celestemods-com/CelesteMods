import { isModTableColumnNameObjectsType__singleEntry } from "../../../../features/mods_maps/mods/modsSliceHelpers";
import { modTableColumnNames } from "../../../../features/mods_maps/mods/modsSliceConstants";




export function ModsTableHeader() {
    return (
        <div className="table__header">
            {modTableColumnNames.map((entry) => {
                if (isModTableColumnNameObjectsType__singleEntry(entry)) {
                    return (
                        <div key={entry.cssName} className={`table__header-item table__item__flex mod-column__${entry.cssName}`}>
                            <h3 className="table__item__flex-child">
                                {entry.headerName}
                            </h3>
                        </div>
                    );
                }
                else {
                    return (
                        <div key={entry.name} className="table__multi-column">
                            <div className="table__item__flex table__multi-column__title">
                                <h2 className=" table__item__flex-child">
                                    {entry.name}
                                </h2>
                            </div>
                            <div className="table__multi-column__columns">
                                {entry.entries.map((entry_inner) => {
                                    return (
                                        <div key={entry_inner.cssName} className={`table__header-item table__item__flex table__multi-column__columns-title mod-column__${entry_inner.cssName}`}>
                                            <h3 className="table__item__flex-child">
                                                {entry_inner.headerName}
                                            </h3>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
            })}
        </div>
    );
}
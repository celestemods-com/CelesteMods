import "../../ModsPage.scss";
import { isModTableColumnNameObjectsType__singleEntry, modTableColumnNames } from "../../../../features/mods/modsSlice";




export default function ModsTableHeader() {
    return (
        <div className="table__header">
            {modTableColumnNames.map((entry) => {
                if (isModTableColumnNameObjectsType__singleEntry(entry)) {
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
    );
}
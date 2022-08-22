import "../../ModsPage.scss";
import { isModForTable__singleEntry, modForTable, modForTable__entry, modsSlice, selectModsForTable, selectModTableItemExpanded } from "../../../../features/mods/modsSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../reduxApp/store";




export default function ModTableItems() {
    const modStates = useSelector(selectModsForTable);


    return (
        <div className="table__items">
            {modStates.map(ModItem)}
        </div>
    );
}




const ModItem = (modState: modForTable) => {
    const dispatch = useDispatch();
    const id = modState.id;
    const isExpanded = useSelector((rootState: RootState) => selectModTableItemExpanded(rootState, id))

    
    const toggleExpanded = () => dispatch(modsSlice.actions.toggleModTableItemExpanded(id));


    return (
        <div key={id.toString()} className={`table__item table__mods-mod expanded-${isExpanded}`} onClick={toggleExpanded}>
            {modState.entries.map(ModItemElement)}
        </div>
    );
}




const ModItemElement = (modEntry: modForTable__entry, entryIndex: number) => {
    if (isModForTable__singleEntry(modEntry)) {
        return (
            <div key={modEntry.cssName} className={`table__item mod-column${modEntry.cssName}`}>
                {modEntry.value}
            </div>
        )
    }
    else {
        return (
            <div key={entryIndex} className="table__multi-column">
                {modEntry.entries.map((innerEntry) => {
                    return (
                        <div key={innerEntry.cssName} className={`table__item mod-column${innerEntry.cssName}`}>
                            {innerEntry.value}
                        </div>
                    );
                })}
            </div>
        );
    }
}
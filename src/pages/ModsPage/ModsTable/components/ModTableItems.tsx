import { useAppDispatch, useAppSelector } from "../../../../reduxApp/hooks";
import { RootState } from "../../../../reduxApp/store";

import { modsSlice, selectModsForTable, selectModTableItemExpanded } from "../../../../features/mods_maps_publishers/mods/modsSlice";
import { isModForTable__singleEntry } from "../../../../features/mods_maps_publishers/mods/modsSliceHelpers";

import { modForTable, modForTable__entry } from "../../../../features/mods_maps_publishers/mods/modsSliceTypes";




export function ModTableItems() {
    const modStates = useAppSelector(selectModsForTable);


    return (
        <div className="table__items">
            {modStates.map(ModItem)}
        </div>
    );
}




const ModItem = (modState: modForTable) => {
    const dispatch = useAppDispatch();
    const id = modState.id;
    const isExpanded = useAppSelector((rootState: RootState) => selectModTableItemExpanded(rootState, id))


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
            <div key={modEntry.cssName} className={`table__item-child table__item__flex mod-column__${modEntry.cssName}`}>
                <p className="table__item__flex-child">
                    {modEntry.value}
                </p>
            </div>
        )
    }
    else {
        return (
            <div key={entryIndex} className="table__multi-column__columns">
                {modEntry.entries.map((innerEntry) => {
                    return (
                        <div key={innerEntry.cssName} className={`table__multi-column__columns-child table__item-child table__item__flex mod-column__${innerEntry.cssName}`}>
                            <p className="table__item__flex-child">
                                {innerEntry.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        );
    }
}
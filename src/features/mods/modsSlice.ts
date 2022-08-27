import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getModState, getModStateForTable } from "./modsSliceHelpers";
import { cmlBaseUri } from "../../constants";

import {
    modsState, setModTableSortColumnAction, setModTableSortDirectionAction, toggleModTableItemBoolActions, setModTableItemBoolActions, modEntities, modTableItemState
} from "./modsSliceTypes";
import { formattedMod } from "../../Imported_Types/frontend";

//TODO: memoize selectors with createSelector() from RTK
//TODO: resolve the //@ts-ignore
//TODO: refactor selectModsState so it accepts other selectors as a parameter




const initialState: modsState = {
    status: "idle",
    sortColumn: "mod-name",
    sortDirection: "Desc",
    entities: {},
}


export const modsSlice = createSlice({
    name: "mods",
    initialState,
    reducers: {
        setModTableSortColumn(state, action: setModTableSortColumnAction) {
            state.sortColumn = action.payload;
        },
        toggleModTableSortDirection(state) {
            const currentDirection = state.sortDirection;
            state.sortDirection = currentDirection === "Asc" ? "Desc" : "Asc";
        },
        setModTableSortDirection(state, action: setModTableSortDirectionAction) {
            state.sortDirection = action.payload;
        },
        toggleModTableItemExpanded(state, action: toggleModTableItemBoolActions) {
            const id = action.payload;
            state.entities[id].modTable.expanded = !state.entities[id].modTable.expanded;
        },
        setModTableItemExpanded(state, action: setModTableItemBoolActions) {
            const {id, bool} = action.payload;
            state.entities[id].modTable.expanded = bool;
        },
        toggleModTableItemHidden(state, action: toggleModTableItemBoolActions) {
            const id = action.payload;
            state.entities[id].modTable.hidden = !state.entities[id].modTable.hidden;
        },
        setModTableItemHidden(state, action: setModTableItemBoolActions) {
            const {id, bool} = action.payload;
            state.entities[id].modTable.hidden = bool;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state, _action) => {
                state.status = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const oldEntities = state.entities;
                const newEntities: modEntities = {};

                action.payload.forEach(modArray => {
                    const fetchedMod = modArray[0];
                    const id = fetchedMod.id;


                    const modState = getModState(fetchedMod);


                    let modTableState: modTableItemState;

                    if (oldEntities.hasOwnProperty(id.toString())) {
                        modTableState = oldEntities[id].modTable;
                    }
                    else {
                        modTableState = {
                            expanded: false,
                            hidden: false,
                        }
                    }


                    newEntities[id] = {
                        modState: modState,
                        modTable: modTableState,
                    }
                });


                state.entities = newEntities;
                state.status = "idle";
            })
            .addCase(fetchMods.rejected, (state, _action) => {
                state.status = "rejected";
            });
    },
})




export const fetchMods = createAsyncThunk("mods", async () => {
    const url = `${cmlBaseUri}/mods`;

    const response: AxiosResponse<formattedMod[][]> = await axios.get(url);

    return response.data;
})




export const selectModsState = (state: RootState) => {
    return state.mods.entities;
}




export const selectModTableItemExpanded = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState);

    return state[id].modTable.expanded;
}




export const selectModsForTable = (rootState: RootState) => {
    const state = selectModsState(rootState);

    return Object.entries(state).map(([_idString, mod]) => getModStateForTable(mod));
}




export const selectModForTable = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState);
    const mod = state[id];

    return getModStateForTable(mod);
}




import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getModState, getModStateForTable } from "./modsSliceHelpers";
import { getCurrentTime } from "../../utils/utils";
import { cmlBaseUri } from "../../constants";

import {
    modsState, setModTableSortColumnAction, setModTableSortDirectionAction, toggleModTableItemBoolActions, setModTableItemBoolActions, modEntities, modTableItemState
} from "./modsSliceTypes";
import { formattedMod } from "../../Imported_Types/frontend";

//TODO: memoize selectors with createSelector() from RTK
//TODO: refactor selectModsState so it accepts other selectors as a parameter




const initialState: modsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
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
            const { id, bool } = action.payload;
            state.entities[id].modTable.expanded = bool;
        },
        toggleModTableItemHidden(state, action: toggleModTableItemBoolActions) {
            const id = action.payload;
            state.entities[id].modTable.hidden = !state.entities[id].modTable.hidden;
        },
        setModTableItemHidden(state, action: setModTableItemBoolActions) {
            const { id, bool } = action.payload;
            state.entities[id].modTable.hidden = bool;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state, _action) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const oldEntities = state.entities;
                const newEntities: modEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


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
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchMods.rejected, (state, _action) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchMods = createAsyncThunk("mods",
    async () => {
        const url = `${cmlBaseUri}/mods`;

        const response: AxiosResponse<formattedMod[][]> = await axios.get(url);

        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { mods } = getState() as RootState;
            const fetchStatus = mods.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectModsState = (state: RootState) => {
    return state.mods;
}




export const selectModsSliceStatus = (rootState: RootState) => {
    const state = selectModsState(rootState);

    return state.status;
}




export const selectModsForTable = (rootState: RootState) => {
    const state = selectModsState(rootState).entities;

    return Object.entries(state).map(([_idString, mod]) => getModStateForTable(mod));
}


export const selectModForTable = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState).entities;
    const mod = state[id];

    return getModStateForTable(mod);
}




export const selectModTableItemExpanded = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState).entities;

    return state[id].modTable.expanded;
}
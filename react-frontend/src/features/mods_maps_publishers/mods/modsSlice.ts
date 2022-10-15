import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getModState, getModStateForTable } from "./modsSliceHelpers";
import { getCurrentTime } from "../../../utils/utils";
import { cmlBaseUri } from "../../../constants";
import { mapsSlice } from "../maps/mapsSlice";

import { modsState, modEntities, SelectModsForTable } from "./modsSliceTypes";
import { formattedMod } from "../../../../../express-backend/src/types/frontend";
import { useParams } from "react-router-dom";

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
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const newEntities: modEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(modArray => {
                    const fetchedMod = modArray[0];
                    const id = fetchedMod.id;


                    newEntities[id] = getModState(fetchedMod);
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchMods.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchMods = createAsyncThunk("mods",
    async (_isInitialLoad: boolean, { dispatch }) => {
        const mapsSliceActions = mapsSlice.actions;
        try {
            dispatch(mapsSliceActions.setSliceFetch_loading);


            const url = `${cmlBaseUri}/mods`;

            const response: AxiosResponse<formattedMod[][]> = await axios.get(url);

            const data = response.data;


            dispatch(mapsSliceActions.setSliceFetch_fulfilledByMods(data));

            return data;
        }
        catch (error) {
            dispatch(mapsSliceActions.setSliceFetch_rejected);
            throw error;
        }
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




export const selectModsForTable = (rootState: RootState, initialModID?: number): SelectModsForTable => {
    const state = selectModsState(rootState).entities;


    const modStates = Object.entries(state).map(([_idString, mod]) => getModStateForTable(mod));


    const isLoaded = modStates && modStates.length ? true : false;

    const returnObject: SelectModsForTable = { modStates };


    if (isLoaded && initialModID !== undefined) {


        if (initialModID !== undefined) {
            let isValid = false;

            for (const mod of modStates) {
                if (mod.id === initialModID) {
                    isValid = true;
                    break;
                }
            }


            returnObject.isValid = isValid;
        }
    }


    return returnObject;
}


export const selectModByID = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState).entities;
    const mod = state[id];

    return mod;
}
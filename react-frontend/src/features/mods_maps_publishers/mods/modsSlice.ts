import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getModState, getModStateForTable } from "./modsSliceHelpers";
import { getCurrentTime } from "../../../utils/utils";
import { cmlBaseUrl, gamebananaBaseImageUrl, gamebananaScreenshotsRequestUrl } from "../../../constants";
import { mapsSlice } from "../maps/mapsSlice";

import {
    modsState, modEntities, SelectModsForTable, SetModRequestStatusAction, GamebananaScreenshotsRequestData, GamebananaScreenshotData, modState, mod
} from "./modsSliceTypes";
import { formattedMod } from "../../../../../express-backend/src/types/frontend";

//TODO: memoize selectors with createSelector() from RTK
//TODO: refactor selectModsState so it accepts other selectors as a parameter




const initialState: modsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {
        cmlApi: {},
        images: {},
    },
    entities: {},
}


export const modsSlice = createSlice({
    name: "mods",
    initialState,
    reducers: {
        setImageUrlsRequestStatus_loading(state, action: SetModRequestStatusAction) {
            const modID = action.payload.modID;

            state.requests.images[modID].fetchStatus = "loading";
        },
        setImageUrlsRequestStatus_rejected(state, action: SetModRequestStatusAction) {
            const modID = action.payload.modID;

            state.requests.images[modID].fetchStatus = "rejected";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const oldEntities = state.entities;
                const newEntities: modEntities = {};


                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();

                if (lastFetchTime >= currentTime - 1000) return;  //if fetched in the last 1000ms, don't update state


                action.payload.forEach(modArray => {
                    const fetchedMod = modArray[0];
                    const id = fetchedMod.id;
                    const oldEntity = oldEntities[id];
                    const oldState = Array.isArray(oldEntity) ? oldEntity[0] : oldEntity;


                    newEntities[id] = getModState(fetchedMod, oldState?.imageUrls);
                });


                state.entities = newEntities;
                state.status = {
                    fetchStatus: "loaded",
                    timeFetched: currentTime,
                };
            })
            .addCase(fetchMods.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            })
            .addCase(fetchImageUrlsByModID.fulfilled, (state, action) => {
                const { modID, data } = action.payload;
                const oldEntity = state.entities[modID];


                const lastFetchTime: number | undefined = state.requests.images[modID]?.timeFetched;
                const currentTime = getCurrentTime();

                if (lastFetchTime && lastFetchTime >= currentTime - 60 * 1000) return;    //if fetched in the last 60s (60,000 ms), don't update state


                const urlsArray = data.map((screenshotObject) => {
                    const fileName = screenshotObject._sFile;

                    return `${gamebananaBaseImageUrl}${fileName}`;
                });
                console.log(`urlsArray = ${urlsArray}`)

                let newEntity: mod;

                if (Array.isArray(oldEntity)) {
                    const oldLatestRev = oldEntity[0];
                    const otherRevs = oldEntity.length > 1 ? oldEntity.slice(1) : [];

                    const newLatestRev: modState = { ...oldLatestRev, imageUrls: urlsArray };

                    newEntity = [newLatestRev, ...otherRevs];
                }
                else {
                    newEntity = { ...oldEntity, imageUrls: urlsArray };
                }
                console.log(`newEntity = ${JSON.stringify(newEntity)}`)

                state.entities[modID] = newEntity;
                state.requests.images[modID] = {
                    fetchStatus: "loaded",
                    timeFetched: currentTime,
                }
            })
    },
})




export const fetchMods = createAsyncThunk("mods",
    async (_isInitialLoad: boolean, { dispatch }) => {
        const mapsSliceActions = mapsSlice.actions;
        try {
            dispatch(mapsSliceActions.setSliceFetch_loading);


            const url = `${cmlBaseUrl}/mods`;

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




export const fetchImageUrlsByModID = createAsyncThunk("mods/images",
    async ({ modID, gamebananaModID }: { modID: number, gamebananaModID: number }, { dispatch }) => {
        console.log("thunk")
        const modsSliceActions = modsSlice.actions;
        try {
            dispatch(modsSliceActions.setImageUrlsRequestStatus_loading);


            const url = `${gamebananaScreenshotsRequestUrl}${modID}`;

            const response: AxiosResponse<GamebananaScreenshotsRequestData> = await axios.get(url);

            const data: GamebananaScreenshotData[] = JSON.parse(response.data.screenshots);


            return { modID, data: data };
        }
        catch (error) {
            dispatch(modsSliceActions.setImageUrlsRequestStatus_rejected);
            throw error;
        }
    },
    {
        condition: ({ modID }, { getState }) => {
            const { mods } = getState() as RootState;
            const fetchStatus = mods.requests.images[modID]?.fetchStatus;


            if (fetchStatus === "loading") return false;
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


export const selectImageUrlsByModID = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState).entities;
    const mod = state[id];
    const modState = Array.isArray(mod) ? mod[0] : mod;

    return modState.imageUrls ?? [];
}
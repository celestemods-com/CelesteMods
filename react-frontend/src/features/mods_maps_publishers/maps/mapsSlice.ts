import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getMapState, getMapStateForTable } from "./mapsSliceHelpers";
import { cmlBaseUri } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";
import { setSliceFetch_loading, setSliceFetch_rejected } from "../../../utils/reduxHelpers";

import { mapEntities, mapsState, setSliceFetch_fulfilledByModsActions } from "./mapsSliceTypes";
import { formattedMap } from "../../../../../express-backend/src/types/frontend";
import { selectModByID } from "../mods/modsSlice";




const initialState: mapsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const mapsSlice = createSlice({
    name: "maps",
    initialState,
    reducers: {
        setSliceFetch_loading,
        setSliceFetch_rejected,
        setSliceFetch_fulfilledByMods(state, action: setSliceFetch_fulfilledByModsActions) {
            const newEntities: mapEntities = {};
            const lastFetchTime = state.status.timeFetched;
            const currentTime = getCurrentTime();


            if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


            action.payload.forEach(modArray => {
                const fetchedMod = modArray[0];
                const maps = fetchedMod.maps;


                maps.forEach((mapArrayOrString) => {
                    if (typeof mapArrayOrString === "string") return;
                    const map = mapArrayOrString[0];

                    const id = map.id;

                    newEntities[id] = getMapState(map);
                });
            });


            state.entities = newEntities;
            state.status.fetchStatus = "loaded";
            state.status.timeFetched = currentTime;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMaps.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchMaps.fulfilled, (state, action) => {
                const newEntities: mapEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(mapArray => {
                    const fetchedMap = mapArray[0];
                    const id = fetchedMap.id;
                    const mapState = getMapState(fetchedMap);


                    newEntities[id] = mapState;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchMaps.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            })
    },
})




export const fetchMaps = createAsyncThunk("maps",
    async () => {
        const url = `${cmlBaseUri}/maps`;


        const response: AxiosResponse<formattedMap[][]> = await axios.get(url);


        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { maps } = getState() as RootState;
            const fetchStatus = maps.status.fetchStatus;


            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectMapsState = (state: RootState) => {
    return state.maps;
}




export const selectMapByID = (rootState: RootState, id: number) => {
    const state = selectMapsState(rootState);
    const map = state.entities[id];


    return map;
}




// export const selectMapsByModID = (rootState: RootState, modID: number) => {
//     const state = selectMapsState(rootState);
//     const entities = state.entities;

//     const mod = selectModByID(rootState, modID);
//     const mapIdsArray = Array.isArray(mod) ? mod[0].maps : mod.maps;


//     const mapsArray = mapIdsArray.map((mapID) => {
//         const mapIdNum = Number(mapID);

//         if (isNaN(mapIdNum)) throw `mapIdNum ${mapIdNum} is NaN`;


//         const map = entities[mapIdNum];

//         return map;
//     });


//     return mapsArray;
// }




export const selectMapsForTableByModID = (rootState: RootState, modID: number) => {
    const state = selectMapsState(rootState);
    const mapEntities = state.entities;

    const mod = selectModByID(rootState, modID);
    const mapIdsArray = Array.isArray(mod) ? mod[0].maps : mod.maps;


    const mapsArray = mapIdsArray.map((mapID) => {
        const mapIdNum = Number(mapID);

        if (isNaN(mapIdNum)) throw `mapIdNum ${mapIdNum} is NaN`;


        const map = mapEntities[mapIdNum];

        return getMapStateForTable(map);
    });


    return mapsArray;
}
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getMapState } from "./mapsSliceHelpers";
import { cmlBaseUri } from "../../constants";
import { getCurrentTime } from "../../utils/utils";

import { mapEntities, mapsState, setSliceFetch_fulfilledByModsActions } from "./mapsSliceTypes";
import { formattedMap, formattedMod } from "../../Imported_Types/frontend";




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
        setSliceFetch_loading(state) {
            state.status.fetchStatus = "loading";
        },
        setSliceFetch_rejected(state) {
            state.status.fetchStatus = "rejected";
        },
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
                    const mapState = getMapState(map);


                    newEntities[id] = {
                        mapState: mapState,
                    }
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


                    newEntities[id] = {
                        mapState: mapState,
                    }
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchMaps.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
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
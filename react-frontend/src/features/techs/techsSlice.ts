import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUri } from "../../constants";
import { getCurrentTime } from "../../utils/utils";

import { techEntities, techsState } from "./techsSliceTypes";
import { formattedTech } from "../../../../express-backend/src/types/frontend";




const initialState: techsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const techsSlice = createSlice({
    name: "techs",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTechs.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchTechs.fulfilled, (state, action) => {
                const newEntities: techEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedTech => {
                    const id = fetchedTech.id;


                    newEntities[id] = fetchedTech;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchTechs.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchTechs = createAsyncThunk("techs",
    async () => {
        const url = `${cmlBaseUri}/techs`;

        const response: AxiosResponse<formattedTech[]> = await axios.get(url);

        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { techs } = getState() as RootState;
            const fetchStatus = techs.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectTechsState = (state: RootState) => {
    return state.techs;
}




export const selectTechByID = (rootState: RootState, id: number) => {
    const state = selectTechsState(rootState);
    const tech = state.entities[id];

    return tech;
}
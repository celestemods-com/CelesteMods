import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUrl } from "../../constants";
import { getCurrentTime } from "../../utils/utils";

import { difficultyEntities, difficultiesState } from "./difficultiesSliceTypes";
import { difficulties } from ".prisma/client";




const initialState: difficultiesState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const difficultiesSlice = createSlice({
    name: "difficulties",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDifficulties.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchDifficulties.fulfilled, (state, action) => {
                const newEntities: difficultyEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedDifficulty => {
                    const id = fetchedDifficulty.id;


                    newEntities[id] = fetchedDifficulty;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchDifficulties.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchDifficulties = createAsyncThunk("difficulties",
    async () => {
        const url = `${cmlBaseUrl}/difficulties`;

        const response: AxiosResponse<difficulties[]> = await axios.get(url);

        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { difficulties } = getState() as RootState;
            const fetchStatus = difficulties.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectDifficultiesState = (state: RootState) => {
    return state.difficulties;
}




export const selectDifficultyByID = (rootState: RootState, id: number) => {
    const state = selectDifficultiesState(rootState);
    const difficulty = state.entities[id];

    return difficulty;
}
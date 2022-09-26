import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUri } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";

import { ratingEntities, ratingsState } from "./ratingsSliceTypes";
import { formattedRating } from "../../../../../express-backend/src/types/frontend";




const initialState: ratingsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const ratingsSlice = createSlice({
    name: "ratings",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRatings.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchRatings.fulfilled, (state, action) => {
                const newEntities: ratingEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedRating => {
                    const id = fetchedRating.id;


                    newEntities[id] = fetchedRating;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchRatings.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchRatings = createAsyncThunk("ratings",
    async () => {
            const url = `${cmlBaseUri}/ratings`;

            const response: AxiosResponse<formattedRating[]> = await axios.get(url);

            return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { ratings } = getState() as RootState;
            const fetchStatus = ratings.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectRatingsState = (state: RootState) => {
    return state.ratings;
}




export const selectRatingByID = (rootState: RootState, id: number) => {
    const state = selectRatingsState(rootState);
    const rating = state.entities[id];

    return rating;
}
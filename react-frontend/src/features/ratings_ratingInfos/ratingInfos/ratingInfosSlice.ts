import { AsyncThunk, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUrl } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";

import { ratingInfoEntities, ratingInfosState, ratingInfoTypes } from "./ratingInfosSliceTypes";
import { ratingInfo, ratingsInfosTreeObjectType } from "../../../../../express-backend/src/types/frontend";




const initialState: ratingInfosState = {
    mods: {
        status: {
            fetchStatus: "notLoaded",
            timeFetched: 0,
        },
        requests: {},
        entities: {},
    },
    maps: {
        status: {
            fetchStatus: "notLoaded",
            timeFetched: 0,
        },
        requests: {},
        entities: {},
    },
}


export const ratingInfosSlice = createSlice({
    name: "ratingInfos",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRatingInfos.pending, (state, action) => {
                const type = action.meta.arg.type;
                state[type].status.fetchStatus = "loading";
            })
            .addCase(fetchRatingInfos.fulfilled, (state, action) => {
                const type = action.meta.arg.type;
                const newEntities: ratingInfoEntities = {};

                const lastFetchTime = state[type].status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                Object.entries(action.payload).forEach(
                    ([id, fetchedRatingInfo]: [string, ratingInfo]) => {
                        newEntities[Number(id)] = fetchedRatingInfo;
                    }
                );


                state[type].entities = newEntities;
                state[type].status.fetchStatus = "loaded";
                state[type].status.timeFetched = currentTime;
            })
            .addCase(fetchRatingInfos.rejected, (state, action) => {
                const type = action.meta.arg.type;
                state[type].status.fetchStatus = "rejected";
            });
    },
})




export const fetchRatingInfos: AsyncThunk<ratingsInfosTreeObjectType, { isInitialLoad: boolean, type: ratingInfoTypes }, {}> = createAsyncThunk("ratingInfos",
    async ({ type }) => {
        const url = `${cmlBaseUrl}/ratings/${type}`;

        const response: AxiosResponse<ratingsInfosTreeObjectType> = await axios.get(url);

        return response.data;
    },
    {
        condition: ({ isInitialLoad, type }, { getState }) => {
            const { ratingInfos } = getState() as RootState;
            const fetchStatus = ratingInfos[type].status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectRatingInfosState = (state: RootState) => {
    return state.ratingInfos;
}




export const selectRatingInfoByID = (rootState: RootState, id: number, type: ratingInfoTypes) => {
    const state = selectRatingInfosState(rootState);
    const ratingInfo = state[type].entities[id];

    return ratingInfo;
}
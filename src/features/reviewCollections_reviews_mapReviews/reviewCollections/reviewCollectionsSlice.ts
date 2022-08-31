import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getReviewCollectionState } from "./reviewCollectionHelpers";
import { cmlBaseUri } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";

import { reviewCollectionEntities, reviewCollectionsState } from "./reviewCollectionsSliceTypes";
import { formattedReviewCollection } from "../../../Imported_Types/frontend";




const initialState: reviewCollectionsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const reviewCollectionsSlice = createSlice({
    name: "reviewCollection",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviewCollections.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchReviewCollections.fulfilled, (state, action) => {
                const newEntities: reviewCollectionEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedReviewCollection => {
                    const id = fetchedReviewCollection.id;


                    newEntities[id] = getReviewCollectionState(fetchedReviewCollection);
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchReviewCollections.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchReviewCollections = createAsyncThunk("reviewCollections",
    async () => {
        const url = `${cmlBaseUri}/reviewcollections`;

        const response: AxiosResponse<formattedReviewCollection[]> = await axios.get(url);

        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { reviewCollections } = getState() as RootState;
            const fetchStatus = reviewCollections.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectReviewCollectionsState = (state: RootState) => {
    return state.reviewCollections;
}




export const selectReviewCollectionByID = (rootState: RootState, id: number) => {
    const state = selectReviewCollectionsState(rootState);
    const reviewCollection = state.entities[id];

    return reviewCollection;
}
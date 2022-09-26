import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getReviewCollectionState } from "./reviewCollectionsSliceHelpers";
import { cmlBaseUri } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";
import { reviewsSlice } from "../reviews/reviewsSlice";
import { mapReviewsSlice } from "../mapReviews/mapReviewsSlice";

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
    name: "reviewCollections",
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
    async (_isInitialLoad: boolean, { dispatch }) => {
        const reviewsSliceActions = reviewsSlice.actions;
        const mapReviewsSliceActions = mapReviewsSlice.actions;

        try {
            dispatch(reviewsSliceActions.setSliceFetch_loading);
            dispatch(mapReviewsSliceActions.setSliceFetch_loading);


            const url = `${cmlBaseUri}/reviewcollections`;

            const response: AxiosResponse<formattedReviewCollection[]> = await axios.get(url);

            const data = response.data;


            dispatch(reviewsSliceActions.setSliceFetch_fulfilledByReviewCollections(data));
            dispatch(mapReviewsSliceActions.setSliceFetch_fulfilledByReviewCollections(data));

            return data;
        }
        catch (error) {
            dispatch(reviewsSliceActions.setSliceFetch_rejected);
            dispatch(mapReviewsSliceActions.setSliceFetch_rejected);
            throw error;
        }
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
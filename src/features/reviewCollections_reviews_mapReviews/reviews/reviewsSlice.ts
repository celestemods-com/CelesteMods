import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getReviewState } from "./reviewsSliceHelpers";
import { cmlBaseUri } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";
import { setSliceFetch_loading, setSliceFetch_rejected } from "../../../utils/reduxHelpers";

import { reviewEntities, reviewsState, setSliceFetch_fulfilledByReviewCollectionsActions } from "./reviewsSliceTypes";
import { formattedReview } from "../../../Imported_Types/frontend";
import { mapReviewsSlice } from "../mapReviews/mapReviewsSlice";




const initialState: reviewsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const reviewsSlice = createSlice({
    name: "reviews",
    initialState,
    reducers: {
        setSliceFetch_loading,
        setSliceFetch_rejected,
        setSliceFetch_fulfilledByReviewCollections(state, action: setSliceFetch_fulfilledByReviewCollectionsActions) {
            const newEntities: reviewEntities = {};
            const lastFetchTime = state.status.timeFetched;
            const currentTime = getCurrentTime();


            if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


            action.payload.forEach(reviewCollection => {
                const reviews = reviewCollection.reviews;

                if (!reviews || !reviews.length) return;


                reviews.forEach((reviewOrString) => {
                    if (typeof reviewOrString === "string") return;

                    const id = reviewOrString.id;

                    newEntities[id] = getReviewState(reviewOrString);
                });
            });


            state.entities = newEntities;
            state.status.fetchStatus = "loaded";
            state.status.timeFetched = currentTime;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                const newEntities: reviewEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedReview => {
                    const id = fetchedReview.id;


                    newEntities[id] = getReviewState(fetchedReview);
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchReviews.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchReviews = createAsyncThunk("reviews",
    async (_isInitialLoad: boolean, { dispatch }) => {
        const mapReviewsSliceActions = mapReviewsSlice.actions;

        try {
            dispatch(mapReviewsSliceActions.setSliceFetch_loading);


            const url = `${cmlBaseUri}/reviews`;

            const response: AxiosResponse<formattedReview[]> = await axios.get(url);

            const data = response.data;


            dispatch(mapReviewsSliceActions.setSliceFetch_fulfilledByReviews(data));

            return data;
        }
        catch (error) {
            dispatch(mapReviewsSliceActions.setSliceFetch_rejected);
            throw error;
        }
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { reviews } = getState() as RootState;
            const fetchStatus = reviews.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectReviewsState = (state: RootState) => {
    return state.reviews;
}




export const selectReviewByID = (rootState: RootState, id: number) => {
    const state = selectReviewsState(rootState);
    const review = state.entities[id];

    return review;
}
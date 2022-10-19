import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { getMapReviewState } from "./mapReviewsSliceHelpers";
import { cmlBaseUrl } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";
import { setSliceFetch_loading, setSliceFetch_rejected } from "../../../utils/reduxHelpers";

import { mapReviewEntities, mapReviewsState, setSliceFetch_fulfilledByReviewCollectionsActions, setSliceFetch_fulfilledByReviewsActions } from "./mapReviewsSliceTypes";
import { formattedMapReview } from "../../../../../express-backend/src/types/frontend";




const initialState: mapReviewsState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const mapReviewsSlice = createSlice({
    name: "mapReviews",
    initialState,
    reducers: {
        setSliceFetch_loading,
        setSliceFetch_rejected,
        setSliceFetch_fulfilledByReviewCollections(state, action: setSliceFetch_fulfilledByReviewCollectionsActions) {
            const newEntities: mapReviewEntities = {};
            const lastFetchTime = state.status.timeFetched;
            const currentTime = getCurrentTime();


            if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


            action.payload.forEach(reviewCollection => {
                const reviews = reviewCollection.reviews;

                if (!reviews || !reviews.length) return;


                reviews.forEach((reviewOrString) => {
                    if (typeof reviewOrString === "string") return;

                    const mapReviews = reviewOrString.mapReviews;

                    if (!mapReviews || !mapReviews.length) return;


                    mapReviews.forEach((mapReviewOrString) => {
                        if (typeof mapReviewOrString === "string") return;

                        const id = reviewOrString.id;

                        newEntities[id] = getMapReviewState(mapReviewOrString);
                    });
                });
            });


            state.entities = newEntities;
            state.status.fetchStatus = "loaded";
            state.status.timeFetched = currentTime;
        },
        setSliceFetch_fulfilledByReviews(state, action: setSliceFetch_fulfilledByReviewsActions) {
            const newEntities: mapReviewEntities = {};
            const lastFetchTime = state.status.timeFetched;
            const currentTime = getCurrentTime();


            if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


            action.payload.forEach(review => {
                const mapReviews = review.mapReviews;

                if (!mapReviews || !mapReviews.length) return;


                mapReviews.forEach((mapReviewOrString) => {
                    if (typeof mapReviewOrString === "string") return;

                    const id = mapReviewOrString.id;

                    newEntities[id] = getMapReviewState(mapReviewOrString);
                });
            });


            state.entities = newEntities;
            state.status.fetchStatus = "loaded";
            state.status.timeFetched = currentTime;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMapReviews.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchMapReviews.fulfilled, (state, action) => {
                const newEntities: mapReviewEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedMapReview => {
                    const id = fetchedMapReview.id;


                    newEntities[id] = getMapReviewState(fetchedMapReview);
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchMapReviews.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchMapReviews = createAsyncThunk("mapReviews",
    async () => {
        const url = `${cmlBaseUrl}/mapReviews`;

        const response: AxiosResponse<formattedMapReview[]> = await axios.get(url);

        return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { mapReviews } = getState() as RootState;
            const fetchStatus = mapReviews.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectMapReviewsState = (state: RootState) => {
    return state.mapReviews;
}




export const selectMapReviewByID = (rootState: RootState, id: number) => {
    const state = selectMapReviewsState(rootState);
    const mapReview = state.entities[id];

    return mapReview;
}
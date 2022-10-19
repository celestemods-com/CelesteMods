import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUrl } from "../../../constants";
import { getCurrentTime } from "../../../utils/utils";

import { publisherEntities, publishersState } from "./publishersSliceTypes";
import { formattedPublisher } from "../../../../../express-backend/src/types/frontend";




const initialState: publishersState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const publishersSlice = createSlice({
    name: "publishers",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublishers.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchPublishers.fulfilled, (state, action) => {
                const newEntities: publisherEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedPublisher => {
                    const id = fetchedPublisher.id;


                    newEntities[id] = fetchedPublisher;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchPublishers.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchPublishers = createAsyncThunk("publishers",
    async () => {
            const url = `${cmlBaseUrl}/publishers`;

            const response: AxiosResponse<formattedPublisher[]> = await axios.get(url);

            return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { publishers } = getState() as RootState;
            const fetchStatus = publishers.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectPublishersState = (state: RootState) => {
    return state.publishers;
}




export const selectPublisherByID = (rootState: RootState, id: number) => {
    const state = selectPublishersState(rootState);
    const publisher = state.entities[id];

    return publisher;
}
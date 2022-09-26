import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import axios, { AxiosResponse } from "axios";

import { cmlBaseUri } from "../../constants";
import { getCurrentTime } from "../../utils/utils";

import { userEntities, usersState } from "./usersSliceTypes";
import { formattedUser } from "../../Imported_Types/frontend";




const initialState: usersState = {
    status: {
        fetchStatus: "notLoaded",
        timeFetched: 0,
    },
    requests: {},
    entities: {},
}


export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status.fetchStatus = "loading";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                const newEntities: userEntities = {};
                const lastFetchTime = state.status.timeFetched;
                const currentTime = getCurrentTime();


                if (lastFetchTime >= currentTime - 500) return;  //if fetched in the last 500ms, don't update state


                action.payload.forEach(fetchedUser => {
                    const id = fetchedUser.id;


                    newEntities[id] = fetchedUser;
                });


                state.entities = newEntities;
                state.status.fetchStatus = "loaded";
                state.status.timeFetched = currentTime;
            })
            .addCase(fetchUsers.rejected, (state) => {
                state.status.fetchStatus = "rejected";
            });
    },
})




export const fetchUsers = createAsyncThunk("users",
    async () => {
            const url = `${cmlBaseUri}/users`;

            const response: AxiosResponse<formattedUser[]> = await axios.get(url);

            return response.data;
    },
    {
        condition: (isInitialLoad: boolean, { getState }) => {
            const { users } = getState() as RootState;
            const fetchStatus = users.status.fetchStatus;

            if (fetchStatus === "loading" || (isInitialLoad && fetchStatus !== "notLoaded")) return false;
        }
    }
)




export const selectUsersState = (state: RootState) => {
    return state.users;
}




export const selectUserByID = (rootState: RootState, id: number) => {
    const state = selectUsersState(rootState);
    const user = state.entities[id];

    return user;
}
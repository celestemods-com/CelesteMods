import React from "react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import { mods_details_type } from "../../Imported_Types/prismaClient";
import axios, { AxiosResponse } from "axios";
import { cmlBaseUri } from "../../constants";
import { formattedMod } from "../../Imported_Types/frontend";




type requestStatus = "idle" | "loading" | "rejected";

type modStateEntities = {
    [key: number]: modState | modState[],
}


export interface modsState {
    status: requestStatus,
    entities: modStateEntities,
}


export interface modState {
    id: number;
    revision: number;
    type: mods_details_type;
    name: string;
    publisherID: number;
    contentWarning: boolean;
    notes?: string;
    shortDescription: string;
    longDescription?: string;
    gamebananaModID?: number;
    approved: boolean;
    /*timeSubmitted: number;
    submittedBy: number;
    timeApproved: number;
    approvedBy: number;*/
}


const initialState: modsState = {
    status: "idle",
    entities: {},
}




export const fetchMods = createAsyncThunk("mods", async () => {
    const url = `${cmlBaseUri}/mods`;
    console.log(url)

    const response: AxiosResponse<formattedMod[][]> = await axios.get(url);
    console.log(response)

    return response.data;
})




export const modsSlice = createSlice({
    name: "mods",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state, _action) => {
                state.status = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const newEntities: modStateEntities = {};

                action.payload.forEach(modArray => {
                    const mod = modArray[0];
                    const modState = getModState(mod);

                    newEntities[mod.id] = modState;
                });

                state.entities = newEntities;
                state.status = "idle";
            })
            .addCase(fetchMods.rejected, (state, _action) => {
                state.status = "rejected";
            });
    },
})




function getModState(mod: formattedMod): modState {
    const modState: modState = {
        id: mod.id,
        revision: mod.revision,
        type: mod.type,
        name: mod.name,
        publisherID: mod.publisherID,
        contentWarning: mod.contentWarning,
        notes: mod.notes,
        shortDescription: mod.shortDescription,
        longDescription: mod.longDescription,
        gamebananaModID: mod.gamebananaModID,
        approved: mod.approved,
    };

    return modState;
}




const selectModsState = (state: RootState) => {
    return state.mods.entities;
}




interface modForTable {
    id: number;
    entries: (modForTable__singleEntry | modForTable__nestedEntry)[];
}

interface modForTable__singleEntry {
    headerName: string;
    cssName: string;
    value: string | number;
}

interface modForTable__nestedEntry {
    name: string;
    entries: modForTable__singleEntry[];
}

export const isModForTable__singleEntry = (entry: modForTable__singleEntry | modForTable__nestedEntry): entry is modForTable__singleEntry => {
    return Object.keys(entry).includes("value");
}

export const selectModsForTable = (rootState: RootState) => {
    const state = selectModsState(rootState);


    return Object.entries(state).map(([_idString, nestedMod]) => {
        const mod = Array.isArray(nestedMod) ? nestedMod[0] : nestedMod;
        const mapCount = 5;
        const quality = 3;
        const communityDifficulty = "hArD i GuEsS";
        const tech = "Wavedashes";
        const minDifficulty = "Medium";
        const maxDifficulty = Math.random() >= 0.5 ? "Hard" : undefined;
        const reviews = ["Map Is Too Easy!", "Map Is Way Too Hard"];


        return <modForTable>{
            id: mod.id,
            entries: [
                {
                    headerName: "Mod Name",
                    cssName: "mod-name",
                    value: mod.name,
                },
                {
                    headerName: "# of Maps",
                    cssName: "map-count",
                    value: mapCount,
                },
                {
                    headerName: "Type",
                    cssName: "mod-type",
                    value: mod.type,
                },
                {
                    name: "Community Rating",
                    entries: [
                        {
                            headerName: "Quality",
                            cssName: "quality",
                            value: quality,
                        },
                        {
                            headerName: "Difficulty",
                            cssName: "community-difficulty",
                            value: communityDifficulty,
                        },
                    ],
                },
                {
                    headerName: "Tech",
                    cssName: "tech",
                    value: tech,
                },
                {
                    headerName: "CML/SC2020 Difficulty",
                    cssName: "cml-difficulty",
                    value: maxDifficulty ? `${minDifficulty} - ${maxDifficulty}` : minDifficulty,
                },
                {
                    headerName: "Reviews",
                    cssName: "reviews",
                    value: reviews.join(", "),
                },
            ],
        };
    });
}
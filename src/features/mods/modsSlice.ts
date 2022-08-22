import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../reduxApp/store";
import { mods_details_type } from "../../Imported_Types/prismaClient";
import axios, { AxiosResponse } from "axios";
import { cmlBaseUri } from "../../constants";
import { formattedMod } from "../../Imported_Types/frontend";

//TODO: memoize selectors with createSelector() from RTK
//TODO: resolve the //@ts-ignore
//TODO: refactor selectModsState so it accepts other selectors as a parameter




type requestStatus = "idle" | "loading" | "rejected";


export interface modState {
    id: number,
    revision: number,
    type: mods_details_type,
    name: string,
    publisherID: number,
    contentWarning: boolean,
    notes?: string,
    shortDescription: string,
    longDescription?: string,
    gamebananaModID?: number,
    approved: boolean,
    /*timeSubmitted: number;
    submittedBy: number;
    timeApproved: number;
    approvedBy: number;*/
}

export type modTableItemState = {
    expanded: boolean,
    hidden: boolean,
}

type mod = {
    modState: modState | modState[],
    modTable: modTableItemState,
}

type modEntities = {
    [key: number]: mod,
}


type modTableSortDirection = "Asc" | "Desc";

export interface modsState {
    status: requestStatus,
    sortColumn: modTableColumnCssNamesType,
    sortDirection: modTableSortDirection,
    entities: modEntities,
}


const initialState: modsState = {
    status: "idle",
    sortColumn: "mod-name",
    sortDirection: "Desc",
    entities: {},
}




export const fetchMods = createAsyncThunk("mods", async () => {
    const url = `${cmlBaseUri}/mods`;

    const response: AxiosResponse<formattedMod[][]> = await axios.get(url);

    return response.data;
})




interface setModTableSortColumnAction {
    payload: modTableColumnCssNamesType;
    type: string;
}

interface setModTableSortDirectionAction {
    payload: modTableSortDirection;
    type: string;
}

interface toggleModTableItemBoolActions {
    payload: number;
    type: string;
}

interface setModTableItemBoolActions {
    payload: {
        id: number;
        bool: boolean;
    };
    type: string;
}




export const modsSlice = createSlice({
    name: "mods",
    initialState,
    reducers: {
        setModTableSortColumn(state, action: setModTableSortColumnAction) {
            state.sortColumn = action.payload;
        },
        toggleModTableSortDirection(state) {
            const currentDirection = state.sortDirection;
            state.sortDirection = currentDirection === "Asc" ? "Desc" : "Asc";
        },
        setModTableSortDirection(state, action: setModTableSortDirectionAction) {
            state.sortDirection = action.payload;
        },
        toggleModTableItemExpanded(state, action: toggleModTableItemBoolActions) {
            const id = action.payload;
            state.entities[id].modTable.expanded = !state.entities[id].modTable.expanded;
        },
        setModTableItemExpanded(state, action: setModTableItemBoolActions) {
            const {id, bool} = action.payload;
            state.entities[id].modTable.expanded = bool;
        },
        toggleModTableItemHidden(state, action: toggleModTableItemBoolActions) {
            const id = action.payload;
            state.entities[id].modTable.hidden = !state.entities[id].modTable.hidden;
        },
        setModTableItemHidden(state, action: setModTableItemBoolActions) {
            const {id, bool} = action.payload;
            state.entities[id].modTable.hidden = bool;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMods.pending, (state, _action) => {
                state.status = "loading";
            })
            .addCase(fetchMods.fulfilled, (state, action) => {
                const oldEntities = state.entities;
                const newEntities: modEntities = {};

                action.payload.forEach(modArray => {
                    const fetchedMod = modArray[0];
                    const id = fetchedMod.id;


                    const modState = getModState(fetchedMod);


                    let modTableState: modTableItemState;

                    if (oldEntities.hasOwnProperty(id.toString())) {
                        modTableState = oldEntities[id].modTable;
                    }
                    else {
                        modTableState = {
                            expanded: false,
                            hidden: false,
                        }
                    }


                    newEntities[id] = {
                        modState: modState,
                        modTable: modTableState,
                    }
                });


                state.entities = newEntities;
                state.status = "idle";
            })
            .addCase(fetchMods.rejected, (state, _action) => {
                state.status = "rejected";
            });
    },
})




export const selectModsState = (state: RootState) => {
    return state.mods.entities;
}




export const selectModTableItemExpanded = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState);

    return state[id].modTable.expanded;
}




const getModState = (mod: formattedMod): modState => {
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




export interface modForTable {
    id: number;
    entries: modForTable__entry[];
}

export type modForTable__entry = modForTable__singleEntry | modForTable__nestedEntry;

interface modForTable__singleEntry {
    cssName: string;
    value: string | number;
}

interface modForTable__nestedEntry {
    entries: modForTable__singleEntry[];
}


export const isModForTable__singleEntry = (entry: modForTable__singleEntry | modForTable__nestedEntry): entry is modForTable__singleEntry => {
    return Object.keys(entry).includes("value");
}


export const selectModsForTable = (rootState: RootState) => {
    const state = selectModsState(rootState);

    return Object.entries(state).map(([_idString, mod]) => getModStateForTable(mod));
}


export const selectModForTable = (rootState: RootState, id: number) => {
    const state = selectModsState(rootState);
    const mod = state[id];

    return getModStateForTable(mod);
}


const getModStateForTable = (mod: mod) => {
    const modState = Array.isArray(mod.modState) ? mod.modState[0] : mod.modState;
    const mapCount = 5;
    const quality = 3;
    const communityDifficulty = "hArD i GuEsS";
    const tech = "Wavedashes";
    const minDifficulty = "Medium";
    const maxDifficulty = Math.random() >= 0.5 ? "Hard" : undefined;
    const reviews = ["Map Is Too Easy!", "Map Is Way Too Hard"];


    return {
        id: modState.id,
        entries: [
            {
                cssName: modTableColumnNames[0].cssName,
                value: modState.name,
            },
            {
                cssName: modTableColumnNames[1].cssName,
                value: mapCount,
            },
            {
                cssName: modTableColumnNames[2].cssName,
                value: modState.type,
            },
            {
                entries: [
                    {
                        cssName: modTableColumnNames[3].entries[0].cssName,
                        value: quality,
                    },
                    {
                        cssName: modTableColumnNames[3].entries[1].cssName,
                        value: communityDifficulty,
                    },
                ],
            },
            {
                cssName: modTableColumnNames[4].cssName,
                value: tech,
            },
            {
                cssName: modTableColumnNames[5].cssName,
                value: maxDifficulty ? `${minDifficulty} - ${maxDifficulty}` : minDifficulty,
            },
            {
                cssName: modTableColumnNames[6].cssName,
                value: reviews.join(", "),
            },
        ],
    } as modForTable;
}




type modTableColumnNameObjectsType = modTableColumnNameObjectsType__singleEntry | modTableColumnNameObjectsType__nestedEntry;

interface modTableColumnNameObjectsType__singleEntry {
    headerName: string;
    cssName: string;
}

interface modTableColumnNameObjectsType__nestedEntry {
    name: string;
    entries: readonly modTableColumnNameObjectsType__singleEntry[];
}

const modTableColumnCssNames = ["mod-name", "map-count", "mod-type", "quality", "community-difficulty", "tech", "cml-difficulty", "reviews"] as const;
type modTableColumnCssNamesType = typeof modTableColumnCssNames[number];


export function isModTableColumnNameObjectsType__singleEntry(modTableColumnNameObject: modTableColumnNameObjectsType): modTableColumnNameObject is modTableColumnNameObjectsType__singleEntry {
    return Object.keys(modTableColumnNameObject).includes("headerName");
}


export const modTableColumnNames = [
    {
        headerName: "Mod Name",
        cssName: modTableColumnCssNames[0],
    },
    {
        headerName: "# of Maps",
        cssName: modTableColumnCssNames[1],
    },
    {
        headerName: "Type",
        cssName: modTableColumnCssNames[2],
    },
    {
        name: "Community Rating",
        entries: [
            {
                headerName: "Quality",
                cssName: modTableColumnCssNames[3],
            },
            {
                headerName: "Difficulty",
                cssName: modTableColumnCssNames[4],
            },
        ],
    },
    {
        headerName: "Tech",
        cssName: modTableColumnCssNames[5],
    },
    {
        headerName: "CML/SC2020 Difficulty",
        cssName: modTableColumnCssNames[6],
    },
    {
        headerName: "Reviews",
        cssName: modTableColumnCssNames[7],
    },
] as const;
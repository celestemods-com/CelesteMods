import { mods_details_type } from "../../Imported_Types/prismaClient";

export type requestStatus = "notLoaded" | "loading" | "loaded" | "rejected";


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

export type mod = {
    modState: modState | modState[],
    modTable: modTableItemState,
}

export type modEntities = {
    [key: number]: mod,
}


export type modTableSortDirection = "Asc" | "Desc";

export interface modsState {
    status: requestStatus,
    sortColumn: modTableColumnCssNamesType,
    sortDirection: modTableSortDirection,
    entities: modEntities,
}

export interface setModTableSortColumnAction {
    payload: modTableColumnCssNamesType;
    type: string;
}

export interface setModTableSortDirectionAction {
    payload: modTableSortDirection;
    type: string;
}

export interface toggleModTableItemBoolActions {
    payload: number;
    type: string;
}

export interface setModTableItemBoolActions {
    payload: {
        id: number;
        bool: boolean;
    };
    type: string;
}


export interface modForTable {
    id: number;
    entries: modForTable__entry[];
}

export type modForTable__entry = modForTable__singleEntry | modForTable__nestedEntry;

export interface modForTable__singleEntry {
    cssName: string;
    value: string | number;
}

export interface modForTable__nestedEntry {
    entries: modForTable__singleEntry[];
}


export type modTableColumnNameObjectsType = modTableColumnNameObjectsType__singleEntry | modTableColumnNameObjectsType__nestedEntry;

export interface modTableColumnNameObjectsType__singleEntry {
    headerName: string;
    cssName: string;
}

export interface modTableColumnNameObjectsType__nestedEntry {
    name: string;
    entries: readonly modTableColumnNameObjectsType__singleEntry[];
}

export type modTableColumnCssNamesType = typeof modTableColumnCssNames[number];
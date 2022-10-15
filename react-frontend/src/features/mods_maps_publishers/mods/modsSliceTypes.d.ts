import { modTableColumnCssNames, modTableColumnNames } from "./modsSliceConstants";
import { mods_details_type } from ".prisma/client";
import { sliceStatus, requestStatuses } from "../../../utils/commonTypes";
import { Record } from "mantine-datatable";


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
    maps: (string | number)[];
    difficulties?: (number | number[])[];
    imageUrls?: string[];
    /*timeSubmitted: number;
    submittedBy: number;
    timeApproved: number;
    approvedBy: number;*/
}

export type mod = modState | modState[]

export type modEntities = {
    [key: number]: mod,
}

export interface modsState {
    status: sliceStatus;
    requests: {
        cmlApi: requestStatuses;
        images: requestStatuses;
    };
    entities: modEntities;
}


export interface modForTable {
    id: number,
    gamebananaModID: number,
    [modTableColumnNames[0].jsName]: string,
    [modTableColumnNames[1].jsName]: number,
    [modTableColumnNames[2].jsName]: string,
    [modTableColumnNames[3].jsName]: {
        [modTableColumnNames[3].entries[0].jsName]: string,
        [modTableColumnNames[3].entries[1].jsName]: string,
    },
    [modTableColumnNames[4].jsName]: string,
    [modTableColumnNames[5].jsName]: string,
    [modTableColumnNames[6].jsName]: string,
}

type test = modTableColumnNamesType[number];

export type modTableColumnNameObjectsType = modTableColumnNameObjectsType__singleEntry | modTableColumnNameObjectsType__nestedEntry;

export interface modTableColumnNameObjectsType__singleEntry {
    headerName: modTableColumnNamesType;
}

export interface modTableColumnNameObjectsType__nestedEntry {
    name: string;
    entries: readonly modTableColumnNameObjectsType__singleEntry[];
}

export interface SelectModsForTable {
    modStates: modForTable[];
    isValid?: boolean;
}


export interface SetModRequestStatusAction {
    type: string;
    payload: {
        modID: number,
    };
}


export interface GamebananaScreenshotsRequestData {
    screenshots: string;
}

export interface GamebananaScreenshotData {
    _nFilesize: number;
    _sCaption: string;
    _sFile: string;
    _sFile100: string;
    _sFile220?: string;
    _sFile530?: string;
    _sFile800?: string;
    _sTicketId: string;
}
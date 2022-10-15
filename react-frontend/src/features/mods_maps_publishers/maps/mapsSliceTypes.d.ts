import { formattedMod } from "../../../../../express-backend/src/types/frontend";
import { sliceStatus, requestStatuses } from "../../../utils/commonTypes";
import { mapsSubTableColumnNames } from "./mapsSliceConstants";


export interface mapState {
    id: number;
    revision: number;
    modID: number;
    minimumModRevision: number;
    name: string;
    canonicalDifficulty: number;
    lengthID: number;
    description?: string;
    notes?: string;
    mapperUserID?: number;
    mapperNameString?: string;
    chapter?: number;
    side?: string;
    modDifficulty?: number | number[];
    overallRank?: number;
    mapRemovedFromModBool: boolean;
    techAny: number[];
    techFC: number[];
    approved: boolean;
    /*timeSubmitted: number;
    submittedBy: number;
    timeApproved: number;
    approvedBy: number;*/
}

export type map = mapState | mapState[];

export type mapEntities = {
    [key: number]: map,
}

export interface mapsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: mapEntities;
}


export interface mapForTable {
    id: number,
    [mapsSubTableColumnNames[0].jsName]: string,
    [mapsSubTableColumnNames[1].jsName]: {
        [mapsSubTableColumnNames[1].entries[0].jsName]: string,
        [mapsSubTableColumnNames[1].entries[1].jsName]: string,
    },
    [mapsSubTableColumnNames[2].jsName]: string,
    [mapsSubTableColumnNames[3].jsName]: string,
}


export interface setSliceFetch_fulfilledByModsActions {
    payload: formattedMod[][];
    type: string;
}
import { ratingInfo } from "../../../../../express-backend/src/types/frontend";
import { sliceStatus, requestStatuses } from "../../../utils/commonTypes";


export type ratingInfoEntities = {
    [key: number]: ratingInfo,
}

export interface ratingInfosTypeState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: ratingInfoEntities;
}

export interface ratingInfosState {
    mods: ratingInfosTypeState,
    maps: ratingInfosTypeState,
}


export type ratingInfoTypes = "mods" | "maps";
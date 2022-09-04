import { formattedReviewCollection, formattedReview } from "../../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export interface mapReviewState {
    id: number;
    reviewID: number;
    mapID: number;
    lengthID: number;
    likes?: string;
    dislikes?: string;
    otherComments?: string;
    displayRating: boolean;
}

export type mapReviewEntities = {
    [key: number]: mapReviewState,
}

export interface mapReviewsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: mapReviewEntities;
}


export interface setSliceFetch_fulfilledByReviewCollectionsActions {
    payload: formattedReviewCollection[];
    type: string;
}

export interface setSliceFetch_fulfilledByReviewsActions {
    payload: formattedReview[];
    type: string;
}
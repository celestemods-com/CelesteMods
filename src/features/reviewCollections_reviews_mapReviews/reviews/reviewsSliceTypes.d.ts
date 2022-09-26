import { formattedReviewCollection } from "../../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../../utils/commonTypes";


export interface reviewState {
    id: number;
    modID: number;
    reviewCollectionID: number;
    timeSubmitted: number;
    likes?: string;
    dislikes?: string;
    otherComments?: string;
    mapReviews?: (string | number)[];
}

export type reviewEntities = {
    [key: number]: reviewState,
}

export interface reviewsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: reviewEntities;
}


export interface setSliceFetch_fulfilledByReviewCollectionsActions {
    payload: formattedReviewCollection[];
    type: string;
}
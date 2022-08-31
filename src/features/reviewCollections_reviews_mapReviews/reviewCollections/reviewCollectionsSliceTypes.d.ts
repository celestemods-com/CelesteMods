import { formattedReviewCollection } from "../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export interface reviewCollectionState {
    id: number;
    userID: number;
    name: string;
    description: string;
    reviews?: (string | number)[];
}

export type reviewCollectionEntities = {
    [key: number]: reviewCollectionState,
}

export interface reviewCollectionsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: reviewCollectionEntities;
}
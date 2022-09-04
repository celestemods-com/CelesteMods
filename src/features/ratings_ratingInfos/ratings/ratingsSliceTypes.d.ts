import { formattedRating } from "../../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../../utils/commonTypes";


export type ratingEntities = {
    [key: number]: formattedRating,
}

export interface ratingsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: ratingEntities;
}
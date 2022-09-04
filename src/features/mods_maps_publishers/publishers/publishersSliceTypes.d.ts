import { formattedPublisher } from "../../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export type publisherEntities = {
    [key: number]: formattedPublisher,
}

export interface publishersState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: publisherEntities;
}
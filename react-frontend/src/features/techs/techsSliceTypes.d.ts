import { formattedTech } from "../../../../express-backend/src/types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export type techEntities = {
    [key: number]: formattedTech,
}

export interface techsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: techEntities;
}
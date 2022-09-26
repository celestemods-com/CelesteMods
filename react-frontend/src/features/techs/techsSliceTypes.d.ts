import { formattedTech } from "../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export type techEntities = {
    [key: number]: formattedTech,
}

export interface techsState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: techEntities;
}
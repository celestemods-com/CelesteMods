import { formattedUser } from "../../Imported_Types/frontend";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export type userEntities = {
    [key: number]: formattedUser,
}

export interface usersState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: userEntities;
}
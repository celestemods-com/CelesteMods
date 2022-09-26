import { difficulties } from ".prisma/client";
import { sliceStatus, requestStatuses } from "../../utils/commonTypes";


export type difficultyEntities = {
    [key: number]: difficulties,
}

export interface difficultiesState {
    status: sliceStatus;
    requests: requestStatuses;
    entities: difficultyEntities;
}
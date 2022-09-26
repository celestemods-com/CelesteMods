import { WritableDraft } from "immer/dist/internal";
import { sliceStatus } from "./commonTypes";




export function setSliceFetch_loading(state: WritableDraft<{ status: sliceStatus }>) {
    state.status.fetchStatus = "loading";
}


export function setSliceFetch_rejected(state: WritableDraft<{ status: sliceStatus }>) {
    state.status.fetchStatus = "rejected";
}
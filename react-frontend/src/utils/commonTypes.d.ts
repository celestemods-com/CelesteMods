type fetchStatus = "notLoaded" | "loading" | "loaded" | "rejected";

export interface sliceStatus {
    fetchStatus: fetchStatus,
    timeFetched: number,
}

export type requestStatuses = { [key: number]: sliceStatus };
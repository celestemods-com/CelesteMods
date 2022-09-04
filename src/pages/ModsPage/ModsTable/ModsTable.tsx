import { useAppSelector, useAppDispatch } from "../../../reduxApp/hooks";

import { useEffect } from "react";
import { selectModsForTable, fetchMods } from "../../../features/mods_maps_publishers/mods/modsSlice";
import { fetchDifficulties } from "../../../features/difficulties/difficultiesSlice";
import { fetchTechs } from "../../../features/techs/techsSlice";
import { fetchReviewCollections } from "../../../features/reviewCollections_reviews_mapReviews/reviewCollections/reviewCollectionsSlice";
import { fetchPublishers } from "../../../features/mods_maps_publishers/publishers/publishersSlice";
import { fetchRatingInfos } from "../../../features/ratings_ratingInfos/ratingInfos/ratingInfosSlice";
import { fetchRatings } from "../../../features/ratings_ratingInfos/ratings/ratingsSlice";

import { ModsTableHeader } from "./components/ModsTableHeader";
import { ModTableItems } from "./components/ModTableItems";

//TODO: implement sorting by column




export function ModsTable() {
    const dispatch = useAppDispatch();


    useEffect(() => {
        dispatch(fetchMods(true));
        dispatch(fetchDifficulties(true));
        dispatch(fetchTechs(true));
        dispatch(fetchReviewCollections(true));
        dispatch(fetchPublishers(true));
        dispatch(fetchRatingInfos({ isInitialLoad: true, type: "mods" }));
        dispatch(fetchRatingInfos({ isInitialLoad: true, type: "maps" }));
        dispatch(fetchRatings(true));
    }, [dispatch]);


    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchMods(false));
        }, 10 * 60 * 1000);     //refresh the mods state every 10 minutes

        return () => clearInterval(interval);


        //TODO: figure out if adding dispatch as a dependency really matters, and, if it does, find out if it could cause memory leaks here
        // eslint-disable-next-line
    }, []);



    const modStates = useAppSelector(selectModsForTable);


    if (!modStates || !modStates.length) {
        return (
            <div>
                Waiting for mods to fetch
            </div>
        )
    }


    return (
        <div className="table table__mods">
            <ModsTableHeader />
            <ModTableItems />
        </div>
    );
}
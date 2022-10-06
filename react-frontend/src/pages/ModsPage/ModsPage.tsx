import { useAppDispatch, useAppSelector } from "../../reduxApp/hooks";
import { DataTable } from "mantine-datatable";
import { fetchMods, selectModsForTable } from "../../features/mods_maps_publishers/mods/modsSlice";
import { modTableColumnNames } from "../../features/mods_maps_publishers/mods/modsSliceConstants";
import { useEffect } from "react";
import { fetchDifficulties } from "../../features/difficulties/difficultiesSlice";
import { fetchTechs } from "../../features/techs/techsSlice";
import { fetchReviewCollections } from "../../features/reviewCollections_reviews_mapReviews/reviewCollections/reviewCollectionsSlice";
import { fetchPublishers } from "../../features/mods_maps_publishers/publishers/publishersSlice";
import { fetchRatingInfos } from "../../features/ratings_ratingInfos/ratingInfos/ratingInfosSlice";
import { fetchRatings } from "../../features/ratings_ratingInfos/ratings/ratingsSlice";
import { fetchUsers } from "../../features/users/usersSlice";



export const ModsPage = () => {
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
        dispatch(fetchUsers(true));
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
        <DataTable
            withBorder
            borderRadius={"sm"}
            striped
            withColumnBorders
            highlightOnHover    //@ts-ignore
            records={modStates}
            columns={[
                {
                    accessor: modTableColumnNames[0].jsName,
                    title: modTableColumnNames[0].headerName,
                },
                {
                    accessor: modTableColumnNames[1].jsName,
                    title: modTableColumnNames[1].headerName,
                },
                {
                    accessor: modTableColumnNames[2].jsName,
                    title: modTableColumnNames[2].headerName,
                },
                {
                    accessor: `${modTableColumnNames[3].jsName}.${modTableColumnNames[3].entries[0].jsName}`,
                    title: modTableColumnNames[3].entries[0].headerName,
                },
                {
                    accessor: `${modTableColumnNames[3].jsName}.${modTableColumnNames[3].entries[1].jsName}`,
                    title: modTableColumnNames[3].entries[1].headerName,
                },
                {
                    accessor: modTableColumnNames[4].jsName,
                    title: modTableColumnNames[4].headerName,
                },
                {
                    accessor: modTableColumnNames[5].jsName,
                    title: modTableColumnNames[5].headerName,
                },
                {
                    accessor: modTableColumnNames[6].jsName,
                    title: modTableColumnNames[6].headerName,
                },
            ]}
        />
    );
}
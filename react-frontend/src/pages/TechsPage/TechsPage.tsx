import { useAppDispatch, useAppSelector } from "../../reduxApp/hooks";
import { DataTable } from "mantine-datatable";
import { fetchMods, selectModsForTable } from "../../features/mods_maps_publishers/mods/modsSlice";
import { modTableColumnNames } from "../../features/mods_maps_publishers/mods/modsSliceConstants";
import { useEffect, useState } from "react";
import { fetchDifficulties } from "../../features/difficulties/difficultiesSlice";
import { fetchTechs } from "../../features/techs/techsSlice";
import { fetchReviewCollections } from "../../features/reviewCollections_reviews_mapReviews/reviewCollections/reviewCollectionsSlice";
import { fetchPublishers } from "../../features/mods_maps_publishers/publishers/publishersSlice";
import { fetchRatingInfos } from "../../features/ratings_ratingInfos/ratingInfos/ratingInfosSlice";
import { fetchRatings } from "../../features/ratings_ratingInfos/ratings/ratingsSlice";
import { fetchUsers } from "../../features/users/usersSlice";
import { useNavigate, useParams } from "react-router-dom";
import { TechDropdown } from "./TechDropdown/TechDropdown";
import { RootState } from "../../reduxApp/store";




export const TechsPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    const [isFetching, setIsFetching] = useState(false);


    let urlModID = useParams().modID;
    let urlModIdNum = Number(urlModID);

    
    const [initialModID] = useState(isNaN(urlModIdNum) ? undefined : urlModIdNum);

    const [expandedRowModIds, setExpandedRowModIds] = useState(initialModID ? [initialModID] : []);

    const { modStates, isValid } = useAppSelector((rootState: RootState) => selectModsForTable(rootState, initialModID));


    useEffect(() => {
        if (isValid === false && urlModIdNum === initialModID) {
            setExpandedRowModIds([]);
        }
        
        //only want this to run once when the page initially loads
        // eslint-disable-next-line
    }, [isValid])


    useEffect(() => {       //TODO: collapse/expand rows as needed when urlModIdNum changes (to handle back button presses)
        const expandedRowModID = expandedRowModIds[0];
        if (!expandedRowModID && urlModID !== undefined) {
            navigate("/mods");
        }
        else if (expandedRowModID !== undefined && expandedRowModID !== urlModIdNum) {
            navigate(`/mods/${expandedRowModID}`);
        }
    }, [expandedRowModIds, urlModID, urlModIdNum, navigate]);


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


    useEffect(() => {
        if (!modStates || !modStates.length) setIsFetching(true);
        else setIsFetching(false);
    }, [modStates]);




    return (
        <DataTable
            withBorder
            borderRadius={"sm"}
            striped
            withColumnBorders
            highlightOnHover
            fetching={isFetching}
            records={modStates}
            columns={[
                {
                    accessor: modTableColumnNames[0].jsName,
                    title: modTableColumnNames[0].headerName,
                    sortable: true,
                },
                {
                    accessor: modTableColumnNames[1].jsName,
                    title: modTableColumnNames[1].headerName,
                    sortable: true,
                },
                {
                    accessor: modTableColumnNames[2].jsName,
                    title: modTableColumnNames[2].headerName,
                    sortable: true,
                },
                {
                    accessor: `${modTableColumnNames[3].jsName}.${modTableColumnNames[3].entries[0].jsName}`,
                    title: modTableColumnNames[3].entries[0].headerName,
                    sortable: true,
                },
                {
                    accessor: `${modTableColumnNames[3].jsName}.${modTableColumnNames[3].entries[1].jsName}`,
                    title: modTableColumnNames[3].entries[1].headerName,
                    sortable: true,
                },
                {
                    accessor: modTableColumnNames[4].jsName,
                    title: modTableColumnNames[4].headerName,
                    sortable: true,
                },
                {
                    accessor: modTableColumnNames[5].jsName,
                    title: modTableColumnNames[5].headerName,
                    sortable: true,
                },
                {
                    accessor: modTableColumnNames[6].jsName,
                    title: modTableColumnNames[6].headerName,
                    sortable: true,
                },
            ]}
            rowExpansion={{
                content: ({ record }) => <TechDropdown modID={record.id} gamebananaModID={record.gamebananaModID} />,
                expanded: {
                    recordIds: expandedRowModIds,
                    onRecordIdsChange: setExpandedRowModIds,
                },
                collapseProps: {
                    transitionDuration: 150,
                    animateOpacity: false,
                    transitionTimingFunction: "ease-out",
                },
                allowMultiple: false,
            }}
        />
    );
}
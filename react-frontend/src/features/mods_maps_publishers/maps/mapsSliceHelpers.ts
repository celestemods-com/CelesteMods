import { formattedMap, formattedMap_collabOrLobby, formattedMap_contest, formattedMap_normal } from "../../../../../express-backend/src/types/frontend";
import { qualities } from "../../../constants";
import { map, mapForTable, mapState } from "./mapsSliceTypes";




export const getMapState = (map: formattedMap): mapState => {
    const mapState: mapState = {
        id: map.id,
        revision: map.revision,
        modID: map.modID,
        minimumModRevision: map.minimumModRevision,
        name: map.name,
        canonicalDifficulty: map.canonicalDifficulty,
        lengthID: map.lengthID,
        description: map.description,
        notes: map.notes,
        mapRemovedFromModBool: map.mapRemovedFromModBool,
        techAny: map.techAny ??= [],
        techFC: map.techFC ??= [],
        approved: map.approved,
    };


    if (isFormattedMap_normal(map)) {
        mapState.chapter = map.chapter;
        mapState.side = map.side;
    }
    else {
        mapState.mapperUserID = map.mapperUserID;
        mapState.mapperNameString = map.mapperNameString;
        mapState.modDifficulty = map.modDifficulty;

        if (isFormattedMap_contest(map)) mapState.overallRank = map.overallRank;
    }


    return mapState;
}




export const getMapStateForTable = (map: map) => {
    const mapState = Array.isArray(map) ? map[0] : map;


    //TODO: get real values
    const quality = 3;
    const communityDifficulty = "hArD i GuEsS";
    const tech = "Wavedashes";
    const length = "Short"


    return {
        id: mapState.id,
        name: mapState.name,
        communityRatings: {
            quality: qualities[quality],
            difficulty: communityDifficulty,
        },
        length: length,
        tech: tech,
    } as mapForTable;
}




const isFormattedMap_normal = (map: formattedMap): map is formattedMap_normal => {
    return (map as formattedMap_normal).chapter !== undefined;
}


const isFormattedMap_contest = (map: formattedMap_collabOrLobby | formattedMap_contest): map is formattedMap_contest => {
    return (map as formattedMap_contest).overallRank !== undefined;
}
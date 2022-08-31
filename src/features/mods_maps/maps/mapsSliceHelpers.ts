import { formattedMap } from "../../../Imported_Types/frontend";
import { mapState } from "./mapsSliceTypes";




export const getMapState = (map: formattedMap): mapState => {
    const mapState: mapState = {
        id: map.id,
        revision: map.revision,
        modID: map.modID,
        minimumModRevision: map.minimumModRevision,
        name: map.name,
        canonicalDifficulty: map.canonicalDifficulty,
        length: map.length,
        description: map.description,
        notes: map.notes,
        mapperUserID: map.mapperUserID,
        mapperNameString: map.mapperNameString,
        chapter: map.chapter,
        side: map.side,
        modDifficulty: map.modDifficulty,
        overallRank: map.overallRank,
        mapRemovedFromModBool: map.mapRemovedFromModBool,
        techAny: map.techAny ??= [],
        techFC: map.techFC ??= [],
        approved: map.approved,
    };

    return mapState;
}
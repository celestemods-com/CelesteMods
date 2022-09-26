import { qualities } from "../../../constants";

import { mod, modForTable, modState } from "./modsSliceTypes";
import { formattedMod } from "../../../../../express-backend/src/types/frontend";




export const getModState = (mod: formattedMod): modState => {
    const mapIDs = mod.maps.map((mapArray) => {
        return typeof mapArray === "string" ? mapArray : mapArray[0].id;
    });


    return {
        id: mod.id,
        revision: mod.revision,
        type: mod.type,
        name: mod.name,
        publisherID: mod.publisherID,
        contentWarning: mod.contentWarning,
        notes: mod.notes,
        shortDescription: mod.shortDescription,
        longDescription: mod.longDescription,
        gamebananaModID: mod.gamebananaModID,
        approved: mod.approved,
        maps: mapIDs,
        difficulties: mod.difficulties,
    }
}




export const getModStateForTable = (mod: mod) => {
    const modState = Array.isArray(mod.modState) ? mod.modState[0] : mod.modState;
    const mapCount = modState.maps.length;


    const quality = 3;
    const communityDifficulty = "hArD i GuEsS";
    const tech = "Wavedashes";
    const minDifficulty = "Medium";
    const maxDifficulty = Math.random() >= 0.5 ? "Hard" : undefined;
    const reviews = ["Map Is Too Easy!", "Map Is Way Too Hard"];


    return {
        id: modState.id,
        name: modState.name,
        mapCount: mapCount,
        type: modState.type,
        communityRatings: {
            quality: qualities[quality],
            difficulty: communityDifficulty,
        },
        tech: tech,
        cmlDifficulty: maxDifficulty ? `${minDifficulty} - ${maxDifficulty}` : minDifficulty,
        reviews: reviews.join(", "),
    } as modForTable;
}
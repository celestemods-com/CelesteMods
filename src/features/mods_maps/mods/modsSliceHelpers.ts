import { modTableColumnNames } from "./modsSliceConstants";
import { qualities } from "../../../constants";

import {
    mod, modForTable, modForTable__singleEntry, modForTable__entry, modTableColumnNameObjectsType, modTableColumnNameObjectsType__singleEntry, modState
} from "./modsSliceTypes";
import { formattedMod } from "../../../Imported_Types/frontend";




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
        entries: [
            {
                cssName: modTableColumnNames[0].cssName,
                value: modState.name,
            },
            {
                cssName: modTableColumnNames[1].cssName,
                value: mapCount,
            },
            {
                cssName: modTableColumnNames[2].cssName,
                value: modState.type,
            },
            {
                entries: [
                    {
                        cssName: modTableColumnNames[3].entries[0].cssName,
                        value: qualities[quality],
                    },
                    {
                        cssName: modTableColumnNames[3].entries[1].cssName,
                        value: communityDifficulty,
                    },
                ],
            },
            {
                cssName: modTableColumnNames[4].cssName,
                value: tech,
            },
            {
                cssName: modTableColumnNames[5].cssName,
                value: maxDifficulty ? `${minDifficulty} - ${maxDifficulty}` : minDifficulty,
            },
            {
                cssName: modTableColumnNames[6].cssName,
                value: reviews.join(", "),
            },
        ],
    } as modForTable;
}




export const isModForTable__singleEntry = (entry: modForTable__entry): entry is modForTable__singleEntry => {
    return (entry as modForTable__singleEntry).value !== undefined;
}


export function isModTableColumnNameObjectsType__singleEntry(modTableColumnNameObject: modTableColumnNameObjectsType): modTableColumnNameObject is modTableColumnNameObjectsType__singleEntry {
    return (modTableColumnNameObject as modTableColumnNameObjectsType__singleEntry).headerName !== undefined;
}
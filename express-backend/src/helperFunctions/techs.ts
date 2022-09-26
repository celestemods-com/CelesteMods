import { toErrorWithMessage } from "./errorHandling";

import { rawTech } from "../types/internal";
import { formattedTech } from "../types/frontend";




export const formatTech = function (rawTech: rawTech) {
    try {
        const id = rawTech.id;
        const name = rawTech.name;
        const description = rawTech.description === null ? undefined : rawTech.description;
        const techVideoObjectsArray = rawTech.techVideos === null ? undefined : rawTech.techVideos;
        const difficultyID = rawTech.difficulties.id;


        let videoUrlsArray;

        if (techVideoObjectsArray && techVideoObjectsArray.length) {
            const techVideoUrlsArray: string[] = [];

            techVideoObjectsArray.forEach((techVideo) => {
                techVideoUrlsArray.push(techVideo.url);
            });

            videoUrlsArray = techVideoUrlsArray;
        }


        const formattedTech: formattedTech = {
            id: id,
            name: name,
            description: description,
            videos: videoUrlsArray,
            difficulty: difficultyID,
        };


        return formattedTech;
    }
    catch (error) {
        return toErrorWithMessage(error);
    }
}
import { mapReviewState } from "./mapReviewSliceTypes";
import { formattedMapReview } from "../../../Imported_Types/frontend";




export const getMapReviewState = (mapReview: formattedMapReview): mapReviewState => {
    return {
        id: mapReview.id,
        reviewID: mapReview.reviewID,
        mapID: mapReview.mapID,
        length: mapReview.length,
        likes: mapReview.likes,
        dislikes: mapReview.dislikes,
        otherComments: mapReview.otherComments,
        displayRating: mapReview.displayRating,
    }
}
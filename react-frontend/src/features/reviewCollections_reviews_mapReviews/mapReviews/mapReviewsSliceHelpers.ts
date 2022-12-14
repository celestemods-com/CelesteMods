import { mapReviewState } from "./mapReviewsSliceTypes";
import { formattedMapReview } from "../../../../../express-backend/src/types/frontend";




export const getMapReviewState = (mapReview: formattedMapReview): mapReviewState => {
    return {
        id: mapReview.id,
        reviewID: mapReview.reviewID,
        mapID: mapReview.mapID,
        lengthID: mapReview.lengthID,
        likes: mapReview.likes,
        dislikes: mapReview.dislikes,
        otherComments: mapReview.otherComments,
        displayRating: mapReview.displayRating,
    }
}
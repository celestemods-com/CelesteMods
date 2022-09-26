import { reviewState } from "./reviewsSliceTypes";
import { formattedReview } from "../../../../../express-backend/src/types/frontend";




export const getReviewState = (review: formattedReview): reviewState => {
    const mapReviewIDs = review.mapReviews?.map((mapReview) => {
        return typeof mapReview === "string" ? mapReview : mapReview.id;
    });


    return {
        id: review.id,
        modID: review.modID,
        reviewCollectionID: review.reviewCollectionID,
        timeSubmitted: review.timeSubmitted,
        likes: review.likes,
        dislikes: review.dislikes,
        otherComments: review.otherComments,
        mapReviews: mapReviewIDs,
    }
}
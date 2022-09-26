import { reviewCollectionState } from "./reviewCollectionsSliceTypes";
import { formattedReviewCollection } from "../../../../../express-backend/src/types/frontend";




export const getReviewCollectionState = (reviewCollection: formattedReviewCollection): reviewCollectionState => {
    const reviewIDs = reviewCollection.reviews?.map((review) => {
        return typeof review === "string" ? review : review.id;
    });


    return {
        id: reviewCollection.id,
        userID: reviewCollection.userID,
        name: reviewCollection.name,
        description: reviewCollection.description,
        reviews: reviewIDs,
    };
}
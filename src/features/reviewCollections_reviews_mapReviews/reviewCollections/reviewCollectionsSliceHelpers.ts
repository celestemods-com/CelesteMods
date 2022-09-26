import { reviewCollectionState } from "./reviewCollectionsSliceTypes";
import { formattedReviewCollection } from "../../../Imported_Types/frontend";




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
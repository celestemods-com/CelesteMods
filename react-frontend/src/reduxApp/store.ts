import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { modsSlice } from "../features/mods_maps_publishers/mods/modsSlice";
import { mapsSlice } from "../features/mods_maps_publishers/maps/mapsSlice";
import { difficultiesSlice } from "../features/difficulties/difficultiesSlice";
import { techsSlice } from "../features/techs/techsSlice";
import { reviewCollectionsSlice } from "../features/reviewCollections_reviews_mapReviews/reviewCollections/reviewCollectionsSlice";
import { reviewsSlice } from "../features/reviewCollections_reviews_mapReviews/reviews/reviewsSlice";
import { mapReviewsSlice } from "../features/reviewCollections_reviews_mapReviews/mapReviews/mapReviewsSlice";
import { publishersSlice } from "../features/mods_maps_publishers/publishers/publishersSlice";
import { ratingInfosSlice } from "../features/ratings_ratingInfos/ratingInfos/ratingInfosSlice";
import { ratingsSlice } from "../features/ratings_ratingInfos/ratings/ratingsSlice";
import { usersSlice } from "../features/users/usersSlice";


export const store = configureStore({
  reducer: {
    mods: modsSlice.reducer,
    maps: mapsSlice.reducer,
    difficulties: difficultiesSlice.reducer,
    techs: techsSlice.reducer,
    reviewCollections: reviewCollectionsSlice.reducer,
    reviews: reviewsSlice.reducer,
    mapReviews: mapReviewsSlice.reducer,
    publishers: publishersSlice.reducer,
    ratingInfos: ratingInfosSlice.reducer,
    ratings: ratingsSlice.reducer,
    users: usersSlice.reducer,
  },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
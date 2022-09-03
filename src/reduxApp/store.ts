import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import { modsSlice } from "../features/mods_maps/mods/modsSlice";
import { mapsSlice } from "../features/mods_maps/maps/mapsSlice";
import { difficultiesSlice } from "../features/difficulties/difficultiesSlice";
import { techsSlice } from "../features/techs/techsSlice";
import { reviewCollectionsSlice } from "../features/reviewCollections_reviews_mapReviews/reviewCollections/reviewCollectionsSlice";
import { reviewsSlice } from "../features/reviewCollections_reviews_mapReviews/reviews/reviewsSlice";
import { mapReviewsSlice } from "../features/reviewCollections_reviews_mapReviews/mapReviews/mapReviewSlice";


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    mods: modsSlice.reducer,
    maps: mapsSlice.reducer,
    difficulties: difficultiesSlice.reducer,
    techs: techsSlice.reducer,
    reviewCollections: reviewCollectionsSlice.reducer,
    reviews: reviewsSlice.reducer,
    mapReviews: mapReviewsSlice.reducer,
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
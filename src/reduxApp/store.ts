import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import { modsSlice } from "../features/mods/modsSlice";
import { mapsSlice } from "../features/maps/mapsSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    mods: modsSlice.reducer,
    maps: mapsSlice.reducer,
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
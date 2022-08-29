import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import { modsSlice } from "../features/mods/modsSlice";
import { mapsSlice } from "../features/maps/mapsSlice";
import { difficultiesSlice } from "../features/difficulties/difficultiesSlice";
import { techsSlice } from "../features/techs/techsSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    mods: modsSlice.reducer,
    maps: mapsSlice.reducer,
    difficulties: difficultiesSlice.reducer,
    techs: techsSlice.reducer,
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
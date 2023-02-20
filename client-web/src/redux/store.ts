import { roomSlice } from "./slices/roomSlice";
import { linkAPI } from "./apis/linkAPI";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import testSlice from "./slices/testSlice";

const rootReducer = combineReducers({
  test: testSlice.reducer,
  room: roomSlice.reducer,
  [linkAPI.reducerPath]: linkAPI.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(linkAPI.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;

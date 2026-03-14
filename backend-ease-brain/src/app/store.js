import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import { notesApi } from "./notesApi";
import { remindersApi } from "./remindersApi";
import { settingsApi } from "./settingsApi";
// import authReducer from "../app/auth/authSlice";
import authReducer from "../components/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [notesApi.reducerPath]: notesApi.reducer,
    [remindersApi.reducerPath]: remindersApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(notesApi.middleware)
      .concat(remindersApi.middleware)
      .concat(settingsApi.middleware),
});

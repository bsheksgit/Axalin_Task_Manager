import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import taskReducer from "./taskSlice";
import snackbarReducer from "./snackbarSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    snackbar: snackbarReducer,
  },
});

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import taskReducer from "./taskSlice";
import snackbarReducer from "./snackbarSlice";
import errorReducer from "./errorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    snackbar: snackbarReducer,
    error: errorReducer,
  },
});

import { createSlice } from "@reduxjs/toolkit";

const errorSlice = createSlice({
  name: "error",
  initialState: {
    hasError: false,
    code: null,
    message: null,
  },
  reducers: {
    setGlobalError: (state, action) => {
      state.hasError = true;
      state.code = action.payload.code || "generic";
      state.message = action.payload.message || null;
    },
    clearGlobalError: (state) => {
      state.hasError = false;
      state.code = null;
      state.message = null;
    },
  },
});

export const { setGlobalError, clearGlobalError } = errorSlice.actions;
export default errorSlice.reducer;

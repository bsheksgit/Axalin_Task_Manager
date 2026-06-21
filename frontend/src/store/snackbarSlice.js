import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: "",
  type: "success", // 'success' or 'error'
  isOpen: false,
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    showSnackbar: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || "success";
      state.isOpen = true;
    },
    hideSnackbar: (state) => {
      state.isOpen = false;
      state.message = "";
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;

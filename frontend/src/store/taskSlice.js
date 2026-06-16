import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTab: "tasks", // 'tasks' or 'relationships'
  selectedTask: null,
  isFormOpen: false,
  isEditing: false,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    openTaskForm: (state, action) => {
      state.isFormOpen = true;
      state.isEditing = !!action.payload;
      state.selectedTask = action.payload || null;
    },
    closeTaskForm: (state) => {
      state.isFormOpen = false;
      state.isEditing = false;
      state.selectedTask = null;
    },
  },
});

export const { setActiveTab, setSelectedTask, openTaskForm, closeTaskForm } =
  taskSlice.actions;
export default taskSlice.reducer;

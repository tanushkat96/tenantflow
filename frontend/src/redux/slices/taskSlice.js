import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filter: {
    projectId: null,
    status: null,
    priority: null,
    assignee: null,
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    },
    
    // Update task status (for drag-and-drop)
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        task.status = status;
      }
    },
    
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    
    clearFilter: (state) => {
      state.filter = {
        projectId: null,
        status: null,
        priority: null,
        assignee: null,
      };
    },
    
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setTasks,
  setCurrentTask,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  setFilter,
  clearFilter,
  setError,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer;
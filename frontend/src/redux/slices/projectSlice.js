import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set projects list
    setProjects: (state, action) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Set current project
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    
    // Add new project
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },
    
    // Update project
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    
    // Delete project
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;
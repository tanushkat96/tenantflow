import { createSlice } from "@reduxjs/toolkit";

// Ensure user object always has _id regardless of backend response format (id vs _id)
const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id, // backend sometimes sends 'id' instead of '_id'
  };
};

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    localStorage.removeItem('user');
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = normalizeUser(action.payload.user);
      state.token = action.payload.token;
      state.error = null;
      // Save token and user to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Remove token and user from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;

// Stores current auth state:

// user
// accessToken
// isAuthenticated
// Handles actions like:
// setUser(user)
// clearUser()


import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

// Get user and token from localStorage (persist across reloads)
const loadFromLocalStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('access_token');
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
};

const { user, token } = loadFromLocalStorage();

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Optional: clear from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    },
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      // Persist to localStorage
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("access_token", token);
    },
    // allow profile updates in the frontend without re-calling getCurrentUser or getUser(id) after a mutation.
    // Keeps Redux and localStorage user state in sync after profile edits
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApi.endpoints.signup.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.access_token;
          state.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(payload.user));
          localStorage.setItem("access_token", payload.access_token);
        }
      )
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          state.user = payload.user;
          state.token = payload.access_token;
          state.isAuthenticated = true;
          localStorage.setItem("user", JSON.stringify(payload.user));
          localStorage.setItem("access_token", payload.access_token);
        }
      )
      .addMatcher(
        authApi.endpoints.getCurrentUser.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
        }
      );
  },
});

export const { logout, setCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;

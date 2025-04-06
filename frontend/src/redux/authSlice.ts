import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from "./authActionTypes"; // Import action types

const API_URL = "http://localhost:5000/api/auth";

// **Login Thunk**
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, mobile, password }: { email?: string; mobile?: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, mobile, password });
      localStorage.setItem("token", response.data.token);
      return response.data; // Return token
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// **Logout Thunk**
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  return { isAuthenticated: false, user: null, token: null }; // Explicitly set the token to null
});

// **Auth Slice**
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, isAuthenticated: false, loading: false, error: null as string | null }, // Define `error` type as string or null
  reducers: {
    // Synchronous actions (non-async)
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = action.payload.user; // Ensure user is set correctly
    },
    loginFail: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.error = null; // Clear error on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset previous error
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user; // Ensure user is stored
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Typecast as string in case of error
      })
      .addCase(logoutUser.fulfilled, () => ({ user: null, isAuthenticated: false, loading: false, error: null, token: null })); // Ensure token is null
  },
});

export const { loginSuccess, loginFail, logout } = authSlice.actions;

export default authSlice.reducer;

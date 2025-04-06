import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Ensure this path is correct
import { useDispatch } from "react-redux";

// ✅ Create a typed dispatch hook for use throughout your app
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Create Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // You can add more reducers here in the future, e.g., for other features
  },
});

// Define RootState type (entire Redux state)
export type RootState = ReturnType<typeof store.getState>;

// Define AppDispatch type (dispatch function used throughout the app)
export type AppDispatch = typeof store.dispatch;

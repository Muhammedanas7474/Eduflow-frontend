import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProfile } from "../../api/auth.api";

// Initial state - we no longer store tokens here.
// isAuthenticated is initially false until we verify session.
const initialState = {
    user: null,
    role: null,
    isAuthenticated: false, // will be set trying to fetch profile on load
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

export const fetchUserProfile = createAsyncThunk("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
    try {
        const response = await getProfile();
        return response.data.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

// New thunk to check auth status on app load
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { dispatch }) => {
    try {
        await dispatch(fetchUserProfile()).unwrap();
        return true;
    } catch (error) {
        return false;
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { role, user } = action.payload;
            // No tokens in state anymore
            state.role = role;
            state.user = user || state.user;
            state.isAuthenticated = true;
            state.status = "succeeded";
        },
        // Remove updateAccessToken
        logout: (state) => {
            state.user = null;
            state.role = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.error = null;

            // LocalStorage cleanup for non-sensitive data if any
            // We removed token storage, so nothing to clear there.
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.role = action.payload.role;
                state.isAuthenticated = true;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.role = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                // Handled by fetchUserProfile basically, but this confirms check is done
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false;
            });
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

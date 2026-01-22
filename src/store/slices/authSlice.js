import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getProfile } from "../../api/auth.api";

const initialState = {
    user: null, // currently the API implies phone number or similar, but verifyOTP doesn't return user object directly except maybe encoded in token
    token: localStorage.getItem("access") || null,
    refreshToken: localStorage.getItem("refresh") || null,
    role: localStorage.getItem("role") || null,
    isAuthenticated: !!localStorage.getItem("access"),
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

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { access, refresh, role, user } = action.payload;
            state.token = access;
            state.refreshToken = refresh;
            state.role = role;
            state.user = user || state.user;
            state.isAuthenticated = true;
            state.status = "succeeded";

            // We also update localStorage here to keep them in sync if the action is dispatched
            // Note: Reducers should ideally be pure, but for this simple migration, 
            // ensuring consistency often happens in component or middleware. 
            // However, to strictly follow Redux rules, we should NOT create side effects here.
            // We will assume the component handles localStorage or we'd use a listener.
            // For now, let's keep it pure and handle localStorage in the component 
            // as planned in the Verification Plan steps.
        },
        updateAccessToken: (state, action) => {
            state.token = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.role = null;
            state.isAuthenticated = false;
            state.status = "idle";
            state.error = null;

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            localStorage.removeItem("role");
            localStorage.removeItem("phone");
            localStorage.removeItem("otp_purpose");
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
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { setCredentials, logout, updateAccessToken } = authSlice.actions;

export default authSlice.reducer;

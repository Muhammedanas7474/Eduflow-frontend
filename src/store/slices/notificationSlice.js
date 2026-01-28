import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/notifications/");
            return response.data; // Assuming BE returns list or { results: [] }
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to fetch notifications");
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await api.post(`/notifications/${notificationId}/read/`, {});
            return { id: notificationId, data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to mark as read");
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post("/notifications/read-all/");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to mark all as read");
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        addNotification: (state, action) => {
            const newNotification = action.payload;
            // Prevent duplicates if backend sends existing ID
            if (!state.items.find(n => n.id === newNotification.id)) {
                state.items.unshift(newNotification);
                state.unreadCount += 1;
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                // Handle different response structures gracefully
                const results = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload.results || [];

                state.items = results;
                state.unreadCount = results.filter(n => !n.is_read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // markNotificationAsRead
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const { id } = action.payload;
                const notification = state.items.find(n => n.id === id);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // markAllAsRead
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach(n => n.is_read = true);
                state.unreadCount = 0;
            });
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

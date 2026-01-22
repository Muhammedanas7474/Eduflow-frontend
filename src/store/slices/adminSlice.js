import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers, createUser, updateUserStatus } from "../../api/admin.api";

const initialState = {
    users: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Helper to extract data from various DRF response formats
const extractData = (response) => {
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && data.data) return data.data; // For single object wrapped in data
    return data;
};

export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const response = await getUsers();
        return extractData(response);
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const createNewUser = createAsyncThunk("admin/createUser", async (userData, { rejectWithValue }) => {
    try {
        await createUser(userData);
        const response = await getUsers(); // Refresh list after creation
        return extractData(response);
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const toggleUser = createAsyncThunk("admin/toggleUser", async ({ id, status }, { rejectWithValue }) => {
    try {
        await updateUserStatus(id, status);
        return { id, status }; // Return id and status to update local state optimistically or via reducer
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Create User
            .addCase(createNewUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createNewUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.users = action.payload; // Updating with fresh list
            })
            .addCase(createNewUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            // Toggle User
            .addCase(toggleUser.fulfilled, (state, action) => {
                const { id, status } = action.payload;
                const existingUser = state.users.find((user) => user.id === id);
                if (existingUser) {
                    existingUser.is_active = status;
                }
            });
    },
});

export default adminSlice.reducer;

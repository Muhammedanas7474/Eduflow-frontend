import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { askDoubt, getProcessingStatus } from "../../api/rag.api";

// ─── Thunks ──────────────────────────────────────────────

export const sendDoubt = createAsyncThunk(
    "rag/sendDoubt",
    async ({ courseId, lessonId, question, currentTime }, { rejectWithValue }) => {
        try {
            const res = await askDoubt(courseId, lessonId, question, currentTime);
            return res.data; // { answer, sources }
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
                return rejectWithValue("This lesson hasn't been processed for AI assistance yet. Please try again later.");
            } else if (status === 202) {
                return rejectWithValue("This lesson is still being processed. Please wait a few minutes and try again.");
            }
            return rejectWithValue(err.response?.data?.detail || "Something went wrong. Please try again.");
        }
    }
);

export const fetchProcessingStatus = createAsyncThunk(
    "rag/fetchProcessingStatus",
    async (lessonId, { rejectWithValue }) => {
        try {
            const res = await getProcessingStatus(lessonId);
            return res.data;
        } catch {
            return rejectWithValue(null);
        }
    }
);

// ─── Slice ───────────────────────────────────────────────

const ragSlice = createSlice({
    name: "rag",
    initialState: {
        messages: [],          // [{ role: 'user'|'bot', content, sources?, isError? }]
        loading: false,
        isOpen: false,
        activeLessonId: null,
        processingStatus: null, // null | { status, chunks_count, ... }
    },
    reducers: {
        toggleChat: (state) => {
            state.isOpen = !state.isOpen;
        },
        openChat: (state) => {
            state.isOpen = true;
        },
        closeChat: (state) => {
            state.isOpen = false;
        },
        addUserMessage: (state, action) => {
            state.messages.push({ role: "user", content: action.payload });
        },
        resetChat: (state) => {
            state.messages = [];
            state.loading = false;
            state.processingStatus = null;
        },
        setActiveLessonId: (state, action) => {
            if (state.activeLessonId !== action.payload) {
                state.activeLessonId = action.payload;
                state.messages = [];
                state.processingStatus = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // sendDoubt
            .addCase(sendDoubt.pending, (state) => {
                state.loading = true;
            })
            .addCase(sendDoubt.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push({
                    role: "bot",
                    content: action.payload.answer,
                    sources: action.payload.sources || [],
                });
            })
            .addCase(sendDoubt.rejected, (state, action) => {
                state.loading = false;
                state.messages.push({
                    role: "bot",
                    content: action.payload || "Something went wrong.",
                    isError: true,
                });
            })
            // fetchProcessingStatus
            .addCase(fetchProcessingStatus.fulfilled, (state, action) => {
                state.processingStatus = action.payload;
            });
    },
});

export const {
    toggleChat,
    openChat,
    closeChat,
    addUserMessage,
    resetChat,
    setActiveLessonId,
} = ragSlice.actions;

export default ragSlice.reducer;

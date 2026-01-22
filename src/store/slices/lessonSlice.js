import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks

// Fetch lessons for a course (Student/Instructor)
// NOTE: Instructor might use generic course details endpoint, but student needs specific lesson list
const extractErrorMessage = (err) => {
    if (err.response) {
        const data = err.response.data;
        if (data && typeof data === 'object') {
            if (data.message) return data.message;
            if (data.detail) return data.detail;
            const messages = Object.entries(data).map(([key, value]) => {
                const valStr = Array.isArray(value) ? value.join(" ") : value;
                return `${key}: ${valStr}`;
            });
            if (messages.length > 0) return messages.join(" | ");
        }
    }
    return err.message || "An unexpected error occurred.";
};

const extractData = (response) => {
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && data.data) return data.data; // Helper for wrapped objects
    return data;
};

// Fetch lessons for a course (Student/Instructor)
export const fetchCourseLessons = createAsyncThunk(
    "lessons/fetchCourseLessons",
    async (courseId, { rejectWithValue }) => {
        try {
            // Based on provided API: GET /api/lessons/?course=<course_id>
            const response = await api.get(`/lessons/?course=${courseId}`);
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Fetch lesson progress (Student)
export const fetchLessonProgress = createAsyncThunk(
    "lessons/fetchLessonProgress",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/lesson-progress/");
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Mark lesson as completed (Student)
export const markLessonComplete = createAsyncThunk(
    "lessons/markLessonComplete",
    async (lessonId, { rejectWithValue }) => {
        try {
            const response = await api.post("/lesson-progress/", { lesson: lessonId });
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Fetch course progress stats (Instructor)
export const fetchCourseProgress = createAsyncThunk(
    "lessons/fetchCourseProgress",
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/instructor/courses/${courseId}/progress/`);
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);


const lessonSlice = createSlice({
    name: "lessons",
    initialState: {
        lessons: [],
        progress: [], // List of completed lesson IDs or objects
        instructorStats: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetLessons: (state) => {
            state.lessons = [];
            state.progress = [];
            state.instructorStats = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchCourseLessons
            .addCase(fetchCourseLessons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseLessons.fulfilled, (state, action) => {
                state.loading = false;
                state.lessons = action.payload;
            })
            .addCase(fetchCourseLessons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchLessonProgress
            .addCase(fetchLessonProgress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLessonProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.progress = action.payload;
            })
            .addCase(fetchLessonProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // markLessonComplete
            .addCase(markLessonComplete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(markLessonComplete.fulfilled, (state, action) => {
                state.loading = false;
                state.progress.push(action.payload); // Add new progress entry
            })
            .addCase(markLessonComplete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchCourseProgress
            .addCase(fetchCourseProgress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.instructorStats = action.payload;
            })
            .addCase(fetchCourseProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, resetLessons } = lessonSlice.actions;
export default lessonSlice.reducer;

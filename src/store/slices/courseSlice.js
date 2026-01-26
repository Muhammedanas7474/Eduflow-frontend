import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    approveCourse,
    rejectCourse,
} from "../../api/courses.api";

const initialState = {
    courses: [],
    currentCourse: null,
    lessons: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    operationStatus: "idle", // For create/update/delete operations
};

// --- COURSES THUNKS ---

// Helper to extract data from various DRF response formats
const extractData = (response) => {
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && data.data) return data.data; // For single object wrapped in data
    return data;
};

const extractErrorMessage = (err) => {
    if (err.response) {
        const data = err.response.data;
        if (data && typeof data === 'object') {
            if (data.message) return data.message;
            if (data.detail) return data.detail;
            // If it's a field error object { field: [errors] }
            const messages = Object.entries(data).map(([key, value]) => {
                const valStr = Array.isArray(value) ? value.join(" ") : value;
                return `${key}: ${valStr}`;
            });
            if (messages.length > 0) return messages.join(" | ");
        }
    }
    return err.message || "An unexpected error occurred.";
};

export const fetchCourses = createAsyncThunk("courses/fetchCourses", async (_, { rejectWithValue }) => {
    try {
        const response = await getCourses();
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const fetchCourseById = createAsyncThunk("courses/fetchCourseById", async (id, { rejectWithValue }) => {
    try {
        const response = await getCourse(id);
        const data = extractData(response);
        return data;
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const createNewCourse = createAsyncThunk("courses/createCourse", async (data, { rejectWithValue }) => {
    try {
        const response = await createCourse(data);
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const updateExistingCourse = createAsyncThunk("courses/updateCourse", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await updateCourse(id, data);
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const removeCourse = createAsyncThunk("courses/deleteCourse", async (id, { rejectWithValue }) => {
    try {
        await deleteCourse(id);
        return id;
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

// --- LESSONS THUNKS ---

export const fetchLessons = createAsyncThunk("courses/fetchLessons", async (courseId, { rejectWithValue }) => {
    try {
        const response = await getLessons(courseId);
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const createNewLesson = createAsyncThunk("courses/createLesson", async (data, { rejectWithValue }) => {
    try {
        const response = await createLesson(data);
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const updateExistingLesson = createAsyncThunk("courses/updateLesson", async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await updateLesson(id, data);
        return extractData(response);
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const removeLesson = createAsyncThunk("courses/deleteLesson", async (id, { rejectWithValue }) => {
    try {
        await deleteLesson(id);
        return id;
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

// --- COURSE APPROVAL THUNKS ---

export const approveCourseById = createAsyncThunk("courses/approveCourse", async (id, { rejectWithValue }) => {
    try {
        const response = await approveCourse(id);
        return { id, ...response.data };
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});

export const rejectCourseById = createAsyncThunk("courses/rejectCourse", async (id, { rejectWithValue }) => {
    try {
        const response = await rejectCourse(id);
        return { id, ...response.data };
    } catch (err) {
        return rejectWithValue(extractErrorMessage(err));
    }
});



const courseSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        resetOperationStatus: (state) => {
            state.operationStatus = "idle";
            state.error = null;
        },
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
            state.lessons = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Courses
            .addCase(fetchCourses.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.courses = action.payload;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Fetch Course By ID
            .addCase(fetchCourseById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentCourse = action.payload;
                // Also cache in the list
                const index = state.courses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                } else {
                    state.courses.push(action.payload);
                }
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Create Course
            .addCase(createNewCourse.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(createNewCourse.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                state.courses.unshift(action.payload);
            })
            .addCase(createNewCourse.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })

            // Update Course
            .addCase(updateExistingCourse.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(updateExistingCourse.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                const index = state.courses.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index] = action.payload;
                }
                if (state.currentCourse?.id === action.payload.id) {
                    state.currentCourse = action.payload;
                }
            })
            .addCase(updateExistingCourse.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })

            // Delete Course
            .addCase(removeCourse.fulfilled, (state, action) => {
                state.courses = state.courses.filter((c) => c.id !== action.payload);
                if (state.currentCourse?.id === action.payload) {
                    state.currentCourse = null;
                }
            })

            // Fetch Lessons
            .addCase(fetchLessons.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchLessons.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.lessons = action.payload;
            })
            .addCase(fetchLessons.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Create Lesson
            .addCase(createNewLesson.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(createNewLesson.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                state.lessons.push(action.payload);
            })
            .addCase(createNewLesson.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })

            // Update Lesson
            .addCase(updateExistingLesson.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(updateExistingLesson.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                const index = state.lessons.findIndex((l) => l.id === action.payload.id);
                if (index !== -1) {
                    state.lessons[index] = action.payload;
                }
            })
            .addCase(updateExistingLesson.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })

            // Delete Lesson
            .addCase(removeLesson.fulfilled, (state, action) => {
                state.lessons = state.lessons.filter((l) => l.id !== action.payload);
            })

            // Approve Course
            .addCase(approveCourseById.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(approveCourseById.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                const index = state.courses.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index].is_approved = true;
                }
                if (state.currentCourse?.id === action.payload.id) {
                    state.currentCourse.is_approved = true;
                }
            })
            .addCase(approveCourseById.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })

            // Reject Course
            .addCase(rejectCourseById.pending, (state) => {
                state.operationStatus = "loading";
            })
            .addCase(rejectCourseById.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
                const index = state.courses.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.courses[index].is_approved = false;
                }
                if (state.currentCourse?.id === action.payload.id) {
                    state.currentCourse.is_approved = false;
                }
            })
            .addCase(rejectCourseById.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            })


    },
});

export const { resetOperationStatus, clearCurrentCourse } = courseSlice.actions;

export default courseSlice.reducer;

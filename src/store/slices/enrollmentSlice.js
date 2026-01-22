import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async Thunks

const extractErrorMessage = (err) => {
    if (err.response) {
        const data = err.response.data;
        if (data && typeof data === 'object') {
            if (data.message) return data.message;
            if (data.detail) return data.detail;
            if (data.non_field_errors) return data.non_field_errors.join(" ");
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
    if (data && data.data) return data.data;
    return data;
};

// Fetch my enrollments (Student)
export const fetchMyEnrollments = createAsyncThunk(
    "enrollments/fetchMyEnrollments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/enrollments/");
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Fetch enrollment requests (Student/Admin)
export const fetchEnrollmentRequests = createAsyncThunk(
    "enrollments/fetchEnrollmentRequests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/enrollment-requests/");
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Create enrollment request (Student)
export const createEnrollmentRequest = createAsyncThunk(
    "enrollments/createEnrollmentRequest",
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await api.post("/enrollment-requests/", { course: courseId });
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Review enrollment request (Admin or Instructor)
export const reviewEnrollmentRequest = createAsyncThunk(
    "enrollments/reviewEnrollmentRequest",
    async ({ requestId, action }, { rejectWithValue }) => {
        try {
            // Try instructor endpoint first
            let response;
            try {
                response = await api.post(`/instructor/enrollment-requests/${requestId}/review/`, { action });
            } catch (instructorError) {
                // If instructor endpoint fails with 403, try admin endpoint
                if (instructorError.response?.status === 403) {
                    response = await api.post(`/admin/enrollment-requests/${requestId}/review/`, { action });
                } else {
                    throw instructorError;
                }
            }
            const data = extractData(response);
            return { requestId, status: data.status };
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Fetch course enrollments (Instructor)
export const fetchCourseEnrollments = createAsyncThunk(
    "enrollments/fetchCourseEnrollments",
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/instructor/courses/${courseId}/enrollments/`);
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

// Enroll user in course (Admin)
export const enrollUserInCourse = createAsyncThunk(
    "enrollments/enrollUserInCourse",
    async ({ studentId, courseId }, { rejectWithValue }) => {
        try {
            const response = await api.post("/enrollments/", { student: studentId, course: courseId });
            return extractData(response);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error));
        }
    }
);

const enrollmentSlice = createSlice({
    name: "enrollments",
    initialState: {
        myEnrollments: [],
        enrollmentRequests: [],
        courseEnrollments: [],
        loading: false,
        operationStatus: "idle", // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetOperationStatus: (state) => {
            state.operationStatus = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchMyEnrollments
            .addCase(fetchMyEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.myEnrollments = action.payload || [];
            })
            .addCase(fetchMyEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.myEnrollments = [];
            })
            // fetchEnrollmentRequests
            .addCase(fetchEnrollmentRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEnrollmentRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.enrollmentRequests = action.payload || [];
            })
            .addCase(fetchEnrollmentRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.enrollmentRequests = []; // Ensure it remains an array on error
            })
            // createEnrollmentRequest
            .addCase(createEnrollmentRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEnrollmentRequest.fulfilled, (state, action) => {
                state.loading = false;
                if (!Array.isArray(state.enrollmentRequests)) {
                    state.enrollmentRequests = [];
                }
                // Handle case where payload might not have id or full structure
                const newReq = action.payload || {};
                const courseId = action.meta.arg;

                // Check for duplicates by course ID since backend might not return full object
                const exists = state.enrollmentRequests.some(r => {
                    const rCourseId = typeof r.course === 'object' ? r.course?.id : r.course;
                    return rCourseId === courseId || r.id === newReq.id;
                });

                if (!exists) {
                    state.enrollmentRequests.push({
                        id: newReq.id || Date.now(), // Fallback ID
                        course: courseId,
                        status: newReq.status || 'PENDING',
                        ...newReq
                    });
                }
            })
            .addCase(createEnrollmentRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // reviewEnrollmentRequest
            .addCase(reviewEnrollmentRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reviewEnrollmentRequest.fulfilled, (state, action) => {
                state.loading = false;
                const { requestId, status } = action.payload;
                const request = state.enrollmentRequests.find(req => req.id === requestId);
                if (request) {
                    request.status = status;
                }
            })
            .addCase(reviewEnrollmentRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // fetchCourseEnrollments
            .addCase(fetchCourseEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
                state.loading = false;
                state.courseEnrollments = action.payload || [];
            })
            .addCase(fetchCourseEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.courseEnrollments = [];
            })
            // enrollUserInCourse
            .addCase(enrollUserInCourse.pending, (state) => {
                state.operationStatus = "loading";
                state.error = null;
            })
            .addCase(enrollUserInCourse.fulfilled, (state, action) => {
                state.operationStatus = "succeeded";
            })
            .addCase(enrollUserInCourse.rejected, (state, action) => {
                state.operationStatus = "failed";
                state.error = action.payload;
            });
    },
});

export const { clearError, resetOperationStatus } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

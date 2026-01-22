import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import courseReducer from "./slices/courseSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import lessonReducer from "./slices/lessonSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        admin: adminReducer,
        courses: courseReducer,
        enrollments: enrollmentReducer,
        lessons: lessonReducer,
    },
});

export default store;

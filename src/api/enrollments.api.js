import api from "./axios";

// ENROLLMENTS
export const getEnrollments = () => {
    return api.get("/enrollments/");
};

export const enrollStudent = (studentId, courseId) => {
    return api.post("/enrollments/", {
        student: studentId,
        course: courseId,
    });
};

// LESSON PROGRESS
export const getLessonProgress = () => {
    return api.get("/lesson-progress/");
};

export const markLessonComplete = (lessonId) => {
    return api.post("/lesson-progress/", {
        lesson: lessonId,
    });
};

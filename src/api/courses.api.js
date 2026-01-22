import api from "./axios";

// COURSES
export const getCourses = () => {
    return api.get("/courses/");
};

export const getCourse = (id) => {
    return api.get(`/courses/${id}/`);
};

export const createCourse = (data) => {
    return api.post("/courses/", data);
};

export const updateCourse = (id, data) => {
    return api.patch(`/courses/${id}/`, data);
};

export const deleteCourse = (id) => {
    return api.delete(`/courses/${id}/`);
};

// LESSONS
export const getLessons = (courseId) => {
    return api.get(`/lessons/?course=${courseId}`);
};

export const createLesson = (data) => {
    return api.post("/lessons/", data);
};

export const updateLesson = (id, data) => {
    return api.patch(`/lessons/${id}/`, data);
};

export const deleteLesson = (id) => {
    return api.delete(`/lessons/${id}/`);
};

// COURSE APPROVAL (Admin only)
export const approveCourse = (id) => {
    return api.post(`/courses/${id}/approve/`);
};

export const rejectCourse = (id) => {
    return api.post(`/courses/${id}/reject/`);
};

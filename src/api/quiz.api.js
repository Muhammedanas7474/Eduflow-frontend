import api from "./axios";

/**
 * Generate a quiz from a PDF resource using AI.
 * POST /api/ai/quizzes/generate-from-pdf/
 */
export const generateQuizFromPDF = (courseId, pdfKey, numQuestions = 5) => {
    return api.post("/ai/quizzes/generate-from-pdf/", {
        course_id: courseId,
        pdf_key: pdfKey,
        num_questions: numQuestions,
    });
};

/**
 * Get all quizzes for a course.
 * GET /api/ai/courses/:courseId/quizzes/
 */
export const getCourseQuizzes = (courseId) => {
    return api.get(`/ai/courses/${courseId}/quizzes/`);
};

/**
 * Get a single quiz with all questions and options.
 * GET /api/ai/quizzes/:quizId/
 */
export const getQuiz = (quizId) => {
    return api.get(`/ai/quizzes/${quizId}/`);
};

/**
 * Get the auto-generated quiz for a lesson (poll endpoint).
 * GET /api/ai/lessons/:lessonId/quiz/
 * Returns: { status: "ready"|"generating"|"failed"|null, quiz_id, quiz? }
 */
export const getLessonQuiz = (lessonId) => {
    return api.get(`/ai/lessons/${lessonId}/quiz/`);
};

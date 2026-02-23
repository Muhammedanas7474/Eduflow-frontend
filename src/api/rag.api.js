import axios from "axios";

/**
 * RAG API — calls the AI service directly.
 *
 * In Docker: nginx proxies /api/v1/* → ai-service:8002
 * In local dev: we hit the AI service directly at localhost:8002
 */

const AI_SERVICE_URL =
    import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:8002";

const aiApi = axios.create({
    baseURL: `${AI_SERVICE_URL}/api/v1`,
});

/**
 * Ask a doubt about a lesson using RAG.
 * @param {number} courseId
 * @param {number} lessonId
 * @param {string} question
 * @param {number|null} currentTime - current video playback position in seconds
 */
export const askDoubt = (courseId, lessonId, question, currentTime = null) => {
    return aiApi.post("/rag/ask", {
        course_id: courseId,
        lesson_id: lessonId,
        question,
        current_time: currentTime,
    });
};

/**
 * Check video processing status for a lesson.
 * @param {number} lessonId
 */
export const getProcessingStatus = (lessonId) => {
    return aiApi.get(`/process-video/status/${lessonId}`);
};

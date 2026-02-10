import React, { useEffect, useState, useRef } from "react";
<<<<<<< HEAD
import { useParams, Link } from "react-router-dom";
=======
import { useParams, Link, useNavigate } from "react-router-dom";
>>>>>>> ed5922e (feat vedio call implementation)
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCourseLessons,
    fetchLessonProgress,
    markLessonComplete,
} from "../../store/slices/lessonSlice";
import { fetchCourseById } from "../../store/slices/courseSlice";
import { fetchMyEnrollments } from "../../store/slices/enrollmentSlice";
<<<<<<< HEAD
=======
import { createDM } from "../../api/chat.api";
import { addRoom, setActiveRoom } from "../../store/slices/chatSlice";
>>>>>>> ed5922e (feat vedio call implementation)

export default function StudentCoursePlayer() {
    const { id: courseId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Selectors
    const { lessons = [], progress, loading: lessonLoading } = useSelector((state) => state.lessons);
    const { currentCourse } = useSelector((state) => state.courses);
    const { myEnrollments = [] } = useSelector((state) => state.enrollments);

    // Local State
    const [activeLesson, setActiveLesson] = useState(null);
    const [enrollmentChecked, setEnrollmentChecked] = useState(false);
    const videoRef = useRef(null);

    // Check enrollment status
    const isEnrolled = myEnrollments.some((e) => {
        const enrolledCourseId = typeof e.course === "object" ? e.course?.id : e.course;
        return String(enrolledCourseId) === String(courseId);
    });

    // Initial Fetch
    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseById(courseId));
            dispatch(fetchMyEnrollments()).then(() => setEnrollmentChecked(true));
        }
    }, [dispatch, courseId]);

    // Only fetch lessons if enrolled
    useEffect(() => {
        if (enrollmentChecked && isEnrolled && courseId) {
            dispatch(fetchCourseLessons(courseId));
            dispatch(fetchLessonProgress());
        }
    }, [dispatch, courseId, enrollmentChecked, isEnrolled]);

    // Set initial active lesson or update when lessons load
    useEffect(() => {
        if (lessons && lessons.length > 0 && !activeLesson) {
            // Try to find first uncompleted lesson? Or just first lesson.
            // Let's just default to first lesson for now.
            // We could verify against progress to find first pending.
            const completedIds = progress.map(p => {
                // progress might be objects { lesson: id, ... } or just IDs if simplified?
                // looking at backend response: list() returns serializer.data of LessonProgressCreateSerializer?
                // LessonProgressCreateSerializer fields = ["lesson"]... wait.
                // The backend view `list` returns `LessonProgressCreateSerializer` (fields=["lesson"])?
                // No, usually `list` uses a different serializer or the same.
                // If it uses `LessonProgressCreateSerializer`, it only returns `lesson`.
                // But usually it returns the full object or we need to check.
                // The prompt backend code:
                // `serializer = self.get_serializer(queryset, many=True)`
                // `LessonProgressCreateSerializer` fields = `["lesson"]`.
                // And `create` returns `{ "lesson": ..., "completed": ..., "completed_at": ... }` in manual response.
                // But `list` returns `serializer.data`.
                // Use `console.log` or assume it returns objects { lesson: ID }.
                // However, `markLessonComplete` thunk returns response.data.data from `create` custom response.

                // Let's assume progress contains objects with `lesson` field.
                // If `LessonProgressCreateSerializer` only has `lesson`, then `serializer.data` is `[{lesson: 1}, {lesson: 2}]`.
                return typeof p === 'object' ? p.lesson : p;
            });

            // Find first incomplete
            const firstIncomplete = lessons.find(l => !completedIds.includes(l.id));
            setActiveLesson(firstIncomplete || lessons[0]);
        }
    }, [lessons, progress, activeLesson]);


    const handleLessonChange = (lesson) => {
        setActiveLesson(lesson);
        // Reset video player?
        if (videoRef.current) {
            videoRef.current.load();
        }
    };

    const handleMarkComplete = async () => {
        if (activeLesson) {
            await dispatch(markLessonComplete(activeLesson.id));
            // Refresh progress ? The thunk updates state.progress.push(payload).
            // If payload is { lesson: id, ... } it works.
        }
    };

    const isCompleted = (lessonId) => {
        return progress.some(p => {
            const pLessonId = typeof p === 'object' ? p.lesson : p;
            return pLessonId === lessonId;
        });
    };

    const handleMessageInstructor = async () => {
        const instructorId = currentCourse?.created_by;
        if (!instructorId) return;
        try {
            const room = await createDM(instructorId);
            dispatch(addRoom(room));
            dispatch(setActiveRoom(room));
            navigate("/student/chat");
        } catch (err) {
            console.error("Failed to create DM:", err);
        }
    };

    if (lessonLoading && lessons.length === 0) {
        return <div className="text-center text-zinc-400 mt-10">Loading course content...</div>;
    }

    // Access denied if not enrolled
    if (enrollmentChecked && !isEnrolled) {
        return (
            <div className="max-w-md mx-auto mt-20 text-center">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m5 0V4a1 1 0 011-1h2a1 1 0 011 1v1m-9 5a7 7 0 1014 0 7 7 0 00-14 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-zinc-400 mb-6">
                        You are not enrolled in this course. Please request enrollment to access the lessons.
                    </p>
                    <Link
                        to="/student/enrollment-requests"
                        className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white max-w-4xl truncate">
                        {currentCourse?.title || "Course Player"}
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {lessons?.length || 0} Lessons
                    </p>
                </div>
                {currentCourse?.created_by && (
                    <button
                        onClick={handleMessageInstructor}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/25"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        💬 Message Instructor
                    </button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Main Player Area */}
                <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    {activeLesson ? (
                        <>
                            <div className="aspect-video bg-black relative">
                                {activeLesson.video_url ? (
                                    <video
                                        ref={videoRef}
                                        controls
                                        className="w-full h-full"
                                        src={activeLesson.video_url}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                        No video available for this lesson.
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex justify-between items-center bg-zinc-900">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">
                                        {activeLesson.title}
                                    </h2>
                                    <p className="text-zinc-400 text-sm">
                                        Lesson {activeLesson.order || lessons.indexOf(activeLesson) + 1}
                                    </p>
                                </div>

                                <button
                                    onClick={handleMarkComplete}
                                    disabled={isCompleted(activeLesson.id)}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${isCompleted(activeLesson.id)
                                        ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                        }`}
                                >
                                    {isCompleted(activeLesson.id) ? "Completed" : "Mark as Completed"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            Select a lesson to start learning
                        </div>
                    )}
                </div>

                {/* Lesson Sidebar */}
                <div className="lg:w-96 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                        <h3 className="font-bold text-white">Course Content</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {(lessons || []).map((lesson, index) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const completed = isCompleted(lesson.id);

                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => handleLessonChange(lesson)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${isActive
                                        ? "bg-emerald-500/10 border-emerald-500/50"
                                        : "bg-zinc-800/50 border-transparent hover:bg-zinc-800"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-full p-1 ${completed ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-500 bg-zinc-700/50"
                                            }`}>
                                            {completed ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="w-4 h-4 flex items-center justify-center text-xs font-mono">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className={`font-medium text-sm ${isActive ? "text-emerald-400" : "text-zinc-200"}`}>
                                                {lesson.title}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">
                                                Video • {lesson.duration || "N/A" /* Duration not in model, just placeholder */}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {(!lessons || lessons.length === 0) && (
                            <div className="text-center p-4 text-zinc-500 text-sm">
                                No lessons found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

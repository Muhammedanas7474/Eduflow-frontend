import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCourseLessons,
    fetchLessonProgress,
    markLessonComplete,
} from "../../store/slices/lessonSlice";
import { fetchCourseById } from "../../store/slices/courseSlice";

export default function StudentCoursePlayer() {
    const { id: courseId } = useParams();
    const dispatch = useDispatch();

    // Selectors
    const { lessons = [], progress, loading: lessonLoading } = useSelector((state) => state.lessons);
    const { currentCourse } = useSelector((state) => state.courses);

    // Local State
    const [activeLesson, setActiveLesson] = useState(null);
    const videoRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseById(courseId));
            dispatch(fetchCourseLessons(courseId));
            dispatch(fetchLessonProgress());
        }
    }, [dispatch, courseId]);

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

    if (lessonLoading && lessons.length === 0) {
        return <div className="text-center text-zinc-400 mt-10">Loading course content...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white max-w-4xl truncate">
                    {currentCourse?.title || "Course Player"}
                </h1>
                <p className="text-zinc-400 text-sm">
                    {lessons?.length || 0} Lessons
                </p>
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

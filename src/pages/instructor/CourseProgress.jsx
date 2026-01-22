import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchCourseProgress } from "../../store/slices/lessonSlice";

export default function CourseProgress() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { instructorStats, loading, error } = useSelector((state) => state.lessons);

    useEffect(() => {
        if (id) {
            dispatch(fetchCourseProgress(id));
        }
    }, [dispatch, id]);

    if (loading && !instructorStats) {
        return <div className="text-center text-zinc-400 mt-10">Loading progress stats...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (!instructorStats) {
        return <div className="text-center text-zinc-400 mt-10">No data available.</div>;
    }

    const { course_title, total_students, lessons } = instructorStats;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <Link to={`/instructor/courses/${id}`} className="text-zinc-500 hover:text-white mb-2 inline-block">
                    &larr; Back to Course
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Course Progress
                </h1>
                <p className="text-zinc-400">
                    {course_title} • {total_students} Students Enrolled
                </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6">
                <h2 className="text-xl font-bold text-white mb-6">Lesson Completion Stats</h2>

                <div className="space-y-6">
                    {lessons && lessons.map(lesson => {
                        const percentage = total_students > 0
                            ? Math.round((lesson.completed_students / total_students) * 100)
                            : 0;

                        return (
                            <div key={lesson.lesson_id}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-white font-medium">{lesson.lesson_title}</span>
                                    <span className="text-zinc-400 text-sm">
                                        {lesson.completed_students} / {total_students} completed ({percentage}%)
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}

                    {(!lessons || lessons.length === 0) && (
                        <div className="text-center text-zinc-500 py-4">
                            No lessons found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

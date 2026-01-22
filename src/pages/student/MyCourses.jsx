import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyEnrollments } from "../../store/slices/enrollmentSlice";

export default function MyCourses() {
    const dispatch = useDispatch();
    const { myEnrollments, loading, error } = useSelector(
        (state) => state.enrollments
    );

    useEffect(() => {
        dispatch(fetchMyEnrollments());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white">My Courses</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-zinc-800 rounded w-full mb-2"></div>
                            <div className="h-3 bg-zinc-800 rounded w-2/3 mb-6"></div>
                            <div className="h-2 bg-zinc-800 rounded-full w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">My Courses</h1>
                <p className="text-zinc-400 mt-2">Continue where you left off</p>
            </div>

            {myEnrollments.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p className="text-zinc-400 mb-4">You are not enrolled in any courses yet.</p>
                    <Link
                        to="/student/enrollment-requests"
                        className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-medium"
                    >
                        Browse available courses
                        <span>→</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myEnrollments.map((enrollment) => (
                        <Link
                            key={enrollment.id || enrollment.course}
                            to={`/student/courses/${enrollment.course}`}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-all group"
                        >
                            <div className="p-6">
                                {/* Title */}
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                    {enrollment.course_title || `Course #${enrollment.course}`}
                                </h3>

                                {/* Description */}
                                <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
                                    {enrollment.course_description || "Continue learning this course"}
                                </p>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Progress</span>
                                        <span className={`font-medium ${enrollment.progress_percentage === 100
                                                ? 'text-emerald-500'
                                                : 'text-zinc-300'
                                            }`}>
                                            {enrollment.progress_percentage || 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${enrollment.progress_percentage === 100
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                                                }`}
                                            style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {enrollment.completed_lessons || 0} of {enrollment.total_lessons || 0} lessons completed
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                    {enrollment.progress_percentage === 100 ? (
                                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                                            ✓ COMPLETED
                                        </span>
                                    ) : enrollment.progress_percentage > 0 ? (
                                        <span className="text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                                            IN PROGRESS
                                        </span>
                                    ) : (
                                        <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                                            NOT STARTED
                                        </span>
                                    )}
                                    <span className="text-zinc-500 text-sm group-hover:text-emerald-500 transition-colors">
                                        Continue →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

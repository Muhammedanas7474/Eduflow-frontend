import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyEnrollments } from "../../store/slices/enrollmentSlice";

const generateGradientFallback = (title) => {
    const defaultTitle = title || "Course";
    let hash = 0;
    for (let i = 0; i < defaultTitle.length; i++) {
        hash = defaultTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = hash % 360;
    const hue2 = (hash * 2) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 30%), hsl(${hue2}, 60%, 20%))`;
};

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
        <div className="w-full">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Courses</h1>
                    <p className="text-emerald-100/60 mt-2">Continue where you left off</p>
                </div>

                {myEnrollments.length === 0 ? (
                    <div className="text-center py-20 bg-[#1e3b2b]/40 rounded-xl border border-emerald-500/20 shadow-inner">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#183424] flex items-center justify-center ring-4 ring-emerald-500/20">
                            <svg className="w-10 h-10 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-white text-2xl font-bold mb-2">No active enrollments</h3>
                        <p className="text-emerald-100/50 mb-6">You haven't enrolled in any courses yet.</p>
                        <Link
                            to="/student/enrollment-requests"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg hover:-translate-y-0.5"
                        >
                            Browse available courses
                            <span>→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-8">
                        {myEnrollments.map((enrollment) => {
                            const courseTitle = enrollment.course_title || `Course #${enrollment.course}`;
                            return (
                                <Link
                                    key={enrollment.id || enrollment.course}
                                    to={`/student/courses/${enrollment.course}`}
                                    className="group relative flex flex-col bg-[#11241a] border border-[#2d5740]/40 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Decorative Top Banner */}
                                    <div
                                        className="w-full h-32 relative"
                                        style={{ background: generateGradientFallback(courseTitle) }}
                                    >
                                        {/* Status Badge Overlays */}
                                        <div className="absolute top-4 right-4">
                                            {enrollment.progress_percentage === 100 ? (
                                                <span className="backdrop-blur-md bg-black/40 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="backdrop-blur-md bg-black/40 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1 bg-[#183424]/90">
                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                                            {courseTitle}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-emerald-100/60 text-sm line-clamp-2 mb-6 min-h-[40px]">
                                            {enrollment.course_description || "Continue your journey in this course."}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="space-y-3 mt-auto">
                                            <div className="flex justify-between text-sm items-end">
                                                <span className="text-emerald-100/70 font-medium tracking-wide">Course Progress</span>
                                                <span className={`font-bold text-lg ${enrollment.progress_percentage === 100
                                                    ? 'text-emerald-400'
                                                    : 'text-white'
                                                    }`}>
                                                    {enrollment.progress_percentage || 0}%
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-[#0a1610] rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${enrollment.progress_percentage === 100
                                                        ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                                        : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                                                        }`}
                                                    style={{ width: `${enrollment.progress_percentage || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-emerald-100/40 text-right">
                                                {enrollment.completed_lessons || 0} / {enrollment.total_lessons || 0} lessons completed
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="mt-6 pt-4 border-t border-emerald-500/10 flex justify-between items-center group/btn">
                                            <span className={`text-sm font-semibold transition-colors ${enrollment.progress_percentage === 100 ? 'text-emerald-500' : 'text-emerald-400 group-hover:text-white'
                                                }`}>
                                                {enrollment.progress_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                                            </span>
                                            <span className="text-emerald-500 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

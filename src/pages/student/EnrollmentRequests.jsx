import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEnrollmentRequests,
    createEnrollmentRequest,
    fetchMyEnrollments,
} from "../../store/slices/enrollmentSlice";
import { fetchCourses } from "../../store/slices/courseSlice";

// Mock categories for the UI filter pills (since backend doesn't have categories yet)
const CATEGORIES = ["All", "Design", "Marketing", "Business", "Technology", "Creative"];

const THEME_IMAGES = {
    "design": "/images/covers/design.jpg",
    "marketing": "/images/covers/marketing.jpg",
    "business": "/images/covers/business.jpg",
    "technology": "/images/covers/technology.jpg",
    "creative": "/images/covers/creative.jpg",
    "other": "/images/covers/other.jpg"
};

// Fallback just in case
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

export default function EnrollmentRequests() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enrollmentRequests = [], myEnrollments = [], loading: reqLoading } = useSelector(
        (state) => state.enrollments || {}
    );
    const { courses, status: courseStatus } = useSelector((state) => state.courses);

    const [loadingCourses, setLoadingCourses] = useState({});
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    // Backend Drive Fetch
    useEffect(() => {
        dispatch(fetchEnrollmentRequests());
        dispatch(fetchMyEnrollments());

        // Build query string based on filters
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (activeCategory !== "All") params.append("category", activeCategory);

        const queryString = params.toString() ? `?${params.toString()}` : "";
        dispatch(fetchCourses(queryString));
    }, [dispatch, searchQuery, activeCategory]);

    // Show toast notification
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const getRequestStatus = (courseId) => {
        const idsMatch = (a, b) => {
            const idA = typeof a === 'object' && a !== null ? a.id : a;
            const idB = typeof b === 'object' && b !== null ? b.id : b;
            return String(idA) === String(idB);
        };
        const isEnrolled = myEnrollments.some(e => idsMatch(e.course, courseId));
        if (isEnrolled) return "APPROVED";
        if (!enrollmentRequests) return null;
        const request = enrollmentRequests.find((r) => idsMatch(r.course, courseId));
        return request ? request.status : null;
    };

    const handleRequest = async (courseId) => {
        const currentStatus = getRequestStatus(courseId);
        if (currentStatus === "APPROVED") {
            showToast("You are already enrolled in this course!", "success");
            return;
        }
        if (currentStatus === "PENDING") {
            showToast("Your enrollment request is already pending.", "warning");
            return;
        }
        if (currentStatus === "REJECTED") {
            showToast("Your previous request was rejected. Contact admin for help.", "error");
            return;
        }

        setLoadingCourses(prev => ({ ...prev, [courseId]: true }));
        try {
            await dispatch(createEnrollmentRequest(courseId)).unwrap();
            showToast("Enrollment request submitted successfully!", "success");
            dispatch(fetchEnrollmentRequests());
        } catch (err) {
            const errString = String(err).toLowerCase();
            if (errString.includes("already submitted") || errString.includes("already enrolled")) {
                showToast("You already have a pending request for this course.", "warning");
                await Promise.all([
                    dispatch(fetchEnrollmentRequests()),
                    dispatch(fetchMyEnrollments())
                ]);
            } else {
                showToast(`Failed: ${err}`, "error");
            }
        } finally {
            setLoadingCourses(prev => ({ ...prev, [courseId]: false }));
        }
    };

    const isLoading = reqLoading || courseStatus === "loading";

    // We no longer need client-side filtering because the backend handles it!
    const filteredCourses = courses;

    return (
        <div className="min-h-screen bg-[#11241a] px-4 sm:px-8 lg:px-12 py-10 rounded-2xl">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl transition-all max-w-sm border backdrop-blur-md ${toast.type === 'success' ? 'bg-[#1b3b2b]/95 border-emerald-500/30 text-emerald-100' :
                    toast.type === 'warning' ? 'bg-[#3b3a1b]/95 border-yellow-500/30 text-yellow-100' :
                        toast.type === 'error' ? 'bg-[#3b1b1b]/95 border-red-500/30 text-red-100' :
                            'bg-[#1e293b]/95 border-slate-500/30 text-slate-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' && <span className="text-emerald-400">✓</span>}
                        {toast.type === 'warning' && <span className="text-yellow-400">⚠</span>}
                        {toast.type === 'error' && <span className="text-red-400">✕</span>}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header & Search */}
            <div className="max-w-[1400px] mx-auto mb-10">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-6 h-6 text-zinc-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for courses"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#1e3b2b] border-none rounded-xl text-white placeholder-emerald-100/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner text-lg transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeCategory === category
                                ? "bg-[#2d5740] text-emerald-50 shadow-md"
                                : "bg-[#183424] text-emerald-100/70 hover:bg-[#20402e] hover:text-white"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="max-w-[1400px] mx-auto">
                {isLoading && enrollmentRequests.length === 0 && courses.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-[#1e3b2b]/50 aspect-video rounded-xl mb-4"></div>
                                <div className="h-5 bg-[#1e3b2b]/50 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-[#1e3b2b]/50 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {filteredCourses.map((course) => {
                            const status = getRequestStatus(course.id);
                            // We mock the user instructor name since created_by might just be an ID or object without a friendly name in this view
                            const instructorName = typeof course.created_by === 'object' ? (course.created_by.full_name || course.created_by.email) : "Instructor";

                            return (
                                <div
                                    key={course.id}
                                    className="group relative flex flex-col items-start cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                                    onClick={() => navigate(`/student/courses/${course.id}/preview`)}
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="w-full aspect-video rounded-xl overflow-hidden mb-4 shadow-lg ring-1 ring-[#2d5740]/30 group-hover:ring-emerald-500/50 transition-all duration-300 relative flex flex-col justify-center items-center text-center p-4"
                                        style={{
                                            background: generateGradientFallback(course.title)
                                        }}
                                    >
                                        <h3 className="text-white/80 font-bold text-xl drop-shadow-md capitalize">
                                            {course.title.substring(0, 20)}{course.title.length > 20 ? '...' : ''}
                                        </h3>
                                        {/* Status Overlays */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {status?.toUpperCase() === "PENDING" && (
                                                <span className="backdrop-blur-md bg-black/40 text-yellow-300 border border-yellow-500/30 px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                                                    Pending
                                                </span>
                                            )}
                                            {status === "APPROVED" && (
                                                <span className="backdrop-blur-md bg-black/40 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold rounded-full shadow-lg">
                                                    Enrolled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata & Actions */}
                                    <div className="w-full flex-1 flex flex-col">
                                        <h2 className="text-white font-semibold text-lg leading-tight mb-1 group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h2>
                                        <p className="text-emerald-400/80 text-sm font-medium mb-4">
                                            Instructor: {instructorName}
                                        </p>

                                        <div className="mt-auto pt-2">
                                            <div className="w-full bg-[#183424] group-hover:bg-emerald-600 border border-emerald-500/20 text-emerald-100 group-hover:text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 text-center shadow-lg">
                                                View Course Details
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredCourses.length === 0 && !isLoading && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-[#1e3b2b] rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📭</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold mb-2">No courses found</h3>
                        <p className="text-emerald-100/50">Try searching for a different term or selecting another category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

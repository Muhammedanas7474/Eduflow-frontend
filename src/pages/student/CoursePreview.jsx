import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseById } from "../../store/slices/courseSlice";
import { fetchEnrollmentRequests, createEnrollmentRequest, fetchMyEnrollments } from "../../store/slices/enrollmentSlice";

const THEME_IMAGES = {
    "design": "/images/covers/design.jpg",
    "marketing": "/images/covers/marketing.jpg",
    "business": "/images/covers/business.jpg",
    "technology": "/images/covers/technology.jpg",
    "creative": "/images/covers/creative.jpg",
    "other": "/images/covers/other.jpg"
};

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

export default function CoursePreview() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentCourse: course, status: courseStatus } = useSelector((state) => state.courses);
    const { enrollmentRequests = [], myEnrollments = [], loading: reqLoading } = useSelector((state) => state.enrollments || {});

    const [requesting, setRequesting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        dispatch(fetchCourseById(courseId));
        dispatch(fetchEnrollmentRequests());
        dispatch(fetchMyEnrollments());
    }, [dispatch, courseId]);

    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const getRequestStatus = () => {
        if (!course) return null;

        const idsMatch = (a, b) => {
            const idA = typeof a === 'object' && a !== null ? a.id : a;
            const idB = typeof b === 'object' && b !== null ? b.id : b;
            return String(idA) === String(idB);
        };
        const isEnrolled = myEnrollments.some(e => idsMatch(e.course, course.id));
        if (isEnrolled) return "APPROVED";
        if (!enrollmentRequests) return null;
        const request = enrollmentRequests.find((r) => idsMatch(r.course, course.id));
        return request ? request.status : null;
    };

    const handleRequest = async () => {
        if (!course) return;
        const currentStatus = getRequestStatus();

        if (currentStatus === "APPROVED") {
            showToast("You are already enrolled!", "success");
            navigate("/student/courses");
            return;
        }
        if (currentStatus === "PENDING") {
            showToast("Your request is already pending.", "warning");
            return;
        }
        if (currentStatus === "REJECTED") {
            showToast("Previous request rejected. Contact admin.", "error");
            return;
        }

        setRequesting(true);
        try {
            await dispatch(createEnrollmentRequest(course.id)).unwrap();
            showToast("Enrollment request submitted successfully!", "success");
            dispatch(fetchEnrollmentRequests());
        } catch (err) {
            const errString = String(err).toLowerCase();
            if (errString.includes("already submitted") || errString.includes("already enrolled")) {
                showToast("You already have a pending request.", "warning");
                dispatch(fetchEnrollmentRequests());
                dispatch(fetchMyEnrollments());
            } else {
                showToast(`Failed: ${err}`, "error");
            }
        } finally {
            setRequesting(false);
        }
    };

    if (courseStatus === "loading") {
        return (
            <div className="min-h-screen bg-[#11241a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#11241a] flex flex-col items-center justify-center text-white p-6">
                <span className="text-6xl mb-4">🤷‍♂️</span>
                <h1 className="text-3xl font-bold mb-2">Course Not Found</h1>
                <p className="text-emerald-100/50 mb-8">The course you are looking for doesn't exist or was removed.</p>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition">
                    Go Back
                </button>
            </div>
        );
    }

    const status = getRequestStatus();
    const instructorName = typeof course.created_by === 'object' ? (course.created_by.full_name || course.created_by.email) : "Instructor";

    // Safety fallback properties
    const coverImage = "";
    const fallbackImage = generateGradientFallback(course.title);

    return (
        <div className="min-h-screen bg-[#11241a] text-white">
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

            {/* Back Button */}
            <div className="px-6 lg:px-12 py-6">
                <button
                    onClick={() => navigate('/student/enrollment-requests')}
                    className="flex items-center text-emerald-400/80 hover:text-emerald-300 transition-colors font-medium border border-emerald-500/20 bg-[#1e3b2b]/40 backdrop-blur-md px-4 py-2 rounded-lg"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Catalog
                </button>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-24">

                {/* Hero Header */}
                <div
                    className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden relative shadow-2xl ring-1 ring-[#2d5740]/30 mb-10 flex items-end p-8 md:p-12"
                    style={{ background: coverImage ? `url(${coverImage}) center/cover` : fallbackImage }}
                >
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1610] via-[#0a1610]/80 to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                        {status?.toUpperCase() === "PENDING" && (
                            <span className="backdrop-blur-md bg-black/40 text-yellow-300 border border-yellow-500/40 px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                                Pending Approval
                            </span>
                        )}
                        {status === "APPROVED" && (
                            <span className="backdrop-blur-md bg-black/40 text-emerald-300 border border-emerald-500/40 px-4 py-2 text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Enrolled
                            </span>
                        )}
                    </div>

                    <div className="relative z-10 w-full max-w-4xl">
                        <div className="flex items-center gap-4 mb-4">
                            {course.category && (
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-md font-semibold text-xs border border-emerald-500/30 uppercase tracking-wider">
                                    {course.category}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                            {course.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-emerald-100/90 font-medium">
                            Taught by <span className="text-white">{instructorName}</span>
                        </p>
                    </div>
                </div>

                {/* Content & Action Sidebar */}
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left side: Description */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-emerald-500">About</span> This Course
                        </h2>

                        <div className="prose prose-invert prose-emerald max-w-none prose-lg">
                            {course.description ? (
                                course.description.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="text-emerald-50/80 leading-relaxed mb-4">{paragraph}</p>
                                ))
                            ) : (
                                <p className="text-emerald-100/40 italic">No description has been provided for this course yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right side: Sticky Action Box */}
                    <div className="w-full lg:w-[380px]">
                        <div className="sticky top-24 bg-[#183424] rounded-2xl p-6 md:p-8 border border-[#2d5740]/50 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-2">Ready to start?</h3>
                            <p className="text-emerald-100/60 mb-8 text-sm">Send a request to the instructor to get full access to all lectures and materials.</p>

                            {!status && (
                                <button
                                    onClick={handleRequest}
                                    disabled={requesting}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/50 px-6 py-4 rounded-xl font-bold text-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {requesting ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                            Requesting...
                                        </span>
                                    ) : "Enroll Now"}
                                </button>
                            )}

                            {status === "PENDING" && (
                                <div className="w-full bg-[#11241a] border border-yellow-500/30 text-yellow-100/80 px-6 py-4 rounded-xl font-medium text-center shadow-inner text-lg">
                                    Request Pending Approval
                                </div>
                            )}

                            {status === "APPROVED" && (
                                <button
                                    onClick={() => navigate('/student/courses')}
                                    className="w-full bg-[#11241a] hover:bg-[#1a3828] border border-emerald-500/50 text-emerald-400 px-6 py-4 rounded-xl font-bold transition-all text-center shadow-inner text-lg"
                                >
                                    Go to Course Player
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

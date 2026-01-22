import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchEnrollmentRequests,
    createEnrollmentRequest,
    fetchMyEnrollments,
} from "../../store/slices/enrollmentSlice";
import { fetchCourses } from "../../store/slices/courseSlice";

export default function EnrollmentRequests() {
    const dispatch = useDispatch();
    const { enrollmentRequests = [], myEnrollments = [], loading: reqLoading } = useSelector(
        (state) => state.enrollments || {}
    );
    const { courses, status: courseStatus } = useSelector((state) => state.courses);

    const [loadingCourses, setLoadingCourses] = useState({});
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchEnrollmentRequests());
        dispatch(fetchMyEnrollments());
        dispatch(fetchCourses());
    }, [dispatch]);

    // Show toast notification
    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Helper to check status of a course
    const getRequestStatus = (courseId) => {
        const idsMatch = (a, b) => {
            const idA = typeof a === 'object' && a !== null ? a.id : a;
            const idB = typeof b === 'object' && b !== null ? b.id : b;
            return String(idA) === String(idB);
        };

        // First check actual enrollments
        const isEnrolled = myEnrollments.some(e => idsMatch(e.course, courseId));
        if (isEnrolled) return "APPROVED";

        if (!enrollmentRequests) return null;
        const request = enrollmentRequests.find((r) => idsMatch(r.course, courseId));
        return request ? request.status : null;
    };

    const handleRequest = async (courseId) => {
        // Check if already has request or is enrolled BEFORE making API call
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
            // Refresh data after successful request
            dispatch(fetchEnrollmentRequests());
        } catch (err) {
            const errString = String(err).toLowerCase();
            if (errString.includes("already submitted") || errString.includes("already enrolled")) {
                showToast("You already have a pending request for this course.", "warning");
                // Refresh to sync state
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all max-w-sm ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
                    toast.type === 'warning' ? 'bg-yellow-500/90 text-black' :
                        toast.type === 'error' ? 'bg-red-500/90 text-white' :
                            'bg-zinc-700 text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' && <span>✓</span>}
                        {toast.type === 'warning' && <span>⚠</span>}
                        {toast.type === 'error' && <span>✕</span>}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">Browse Courses</h1>
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {isLoading && enrollmentRequests.length === 0 && courses.length === 0 ? (
                <div className="text-center text-zinc-400">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {courses
                        .filter(course =>
                            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                        .map((course) => {
                            const status = getRequestStatus(course.id);
                            return (
                                <div
                                    key={course.id}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                >
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">
                                            {course.title}
                                        </h2>
                                        <p className="text-zinc-400 max-w-2xl">{course.description}</p>
                                    </div>

                                    <div className="shrink-0">
                                        {/* Debug logging (can be removed later) */}
                                        {/* {console.log(`Course ${course.id} status:`, status)} */}

                                        {status?.toUpperCase() === "PENDING" && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
                                                Processing
                                            </span>
                                        )}
                                        {status === "APPROVED" && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500">
                                                Ongoing
                                            </span>
                                        )}
                                        {status?.toUpperCase() === "REJECTED" && (
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-500">
                                                    Request Rejected
                                                </span>
                                            </div>

                                        )}
                                        {!status && (
                                            <button
                                                onClick={() => handleRequest(course.id)}
                                                disabled={loadingCourses[course.id]}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loadingCourses[course.id] ? "Requesting..." : "Request Enrollment"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                    {courses.length === 0 && !isLoading && (
                        <div className="text-center text-zinc-500">
                            No courses available at the moment.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

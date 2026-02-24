import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../store/slices/courseSlice";
import {
    fetchEnrollmentRequests,
    reviewEnrollmentRequest
} from "../../store/slices/enrollmentSlice";

export default function InstructorEnrollments() {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const { enrollmentRequests, loading } = useSelector((state) => state.enrollments);
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [toast, setToast] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    useEffect(() => {
        dispatch(fetchCourses());
        dispatch(fetchEnrollmentRequests());
    }, [dispatch]);

    const showToast = (message, type = "info") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Filter requests for instructor's courses only
    const instructorCourseIds = courses.map(c => c.id);
    let filteredRequests = enrollmentRequests.filter(req => {
        const courseId = typeof req.course === 'object' ? req.course?.id : req.course;
        const matchesCourse = instructorCourseIds.includes(courseId);
        const matchesFilter = selectedCourse === "all" || courseId === parseInt(selectedCourse);
        return matchesCourse && matchesFilter;
    });

    // Custom Sort: Always put PENDING requests at the top. Within the same status, sort by newest (requested_at descending).
    filteredRequests = [...filteredRequests].sort((a, b) => {
        if (a.status === "PENDING" && b.status !== "PENDING") return -1;
        if (b.status === "PENDING" && a.status !== "PENDING") return 1;
        // Both are PENDING or neither are PENDING, sort by requested_at descending
        const dateA = new Date(a.requested_at).getTime();
        const dateB = new Date(b.requested_at).getTime();
        return dateB - dateA;
    });

    const getCourseTitle = (courseId) => {
        const id = typeof courseId === 'object' ? courseId?.id : courseId;
        const course = courses.find(c => c.id === id);
        return course?.title || `Course #${id}`;
    };

    const handleAction = async (requestId, action) => {
        setLoadingId(requestId);
        try {
            await dispatch(reviewEnrollmentRequest({ requestId, action })).unwrap();
            showToast(`Request ${action}d successfully!`, action === "approve" ? "success" : "warning");
            dispatch(fetchEnrollmentRequests());
        } catch (err) {
            showToast(`Failed: ${err}`, "error");
        } finally {
            setLoadingId(null);
        }
    };

    const pendingCount = filteredRequests.filter(r => r.status === "PENDING").length;

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-sm ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
                    toast.type === 'warning' ? 'bg-yellow-500/90 text-black' :
                        toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-zinc-700 text-white'
                    }`}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Enrollment Requests</h1>
                    <p className="text-emerald-100/60 mt-1">Manage student enrollment requests for your courses</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-2 bg-[#183424] border border-[#2d5740]/40 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 shadow-inner"
                    >
                        <option value="all">All Courses</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 shadow-inner">
                    <div className="text-4xl font-extrabold text-white">{filteredRequests.length}</div>
                    <div className="text-sm font-medium text-emerald-100/50 uppercase tracking-wider mt-2">Total Requests</div>
                </div>
                <div className="bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-yellow-900/10 transition-all group">
                    <div className="text-4xl font-extrabold text-yellow-500 group-hover:scale-110 origin-left transition-transform">{pendingCount}</div>
                    <div className="text-sm font-medium text-yellow-500/70 uppercase tracking-wider mt-2">Pending</div>
                </div>
                <div className="bg-[#11241a] border border-[#2d5740]/40 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-emerald-900/10 transition-all group">
                    <div className="text-4xl font-extrabold text-emerald-500 group-hover:scale-110 origin-left transition-transform">
                        {filteredRequests.filter(r => r.status === "APPROVED").length}
                    </div>
                    <div className="text-sm font-medium text-emerald-500/70 uppercase tracking-wider mt-2">Approved</div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-[#11241a] border border-[#2d5740]/40 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#2d5740]/30 text-[11px] font-bold text-emerald-100/50 uppercase tracking-wider bg-[#0a1610]/50">
                            <th className="p-5 pl-6">Course</th>
                            <th className="p-5">Requested</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d5740]/20">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-emerald-100/50 animate-pulse">Loading requests...</td>
                            </tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-[#183424]/50 transition-colors">
                                    <td className="p-5 pl-6">
                                        <span className="font-bold text-white text-sm">
                                            {getCourseTitle(request.course)}
                                        </span>
                                    </td>
                                    <td className="p-5 text-sm text-emerald-100/60 font-medium tracking-wide">
                                        {request.requested_at
                                            ? new Date(request.requested_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                            : "--"
                                        }
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === "PENDING"
                                            ? "bg-yellow-500/10 text-yellow-500"
                                            : request.status === "APPROVED"
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-red-500/10 text-red-500"
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right pr-6">
                                        {request.status === "PENDING" && (
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleAction(request.id, "approve")}
                                                    disabled={loadingId === request.id}
                                                    className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50 ring-1 ring-emerald-500/30 hover:ring-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                >
                                                    {loadingId === request.id ? "..." : "Approve"}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, "reject")}
                                                    disabled={loadingId === request.id}
                                                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 ring-1 ring-red-500/30 hover:ring-red-500"
                                                >
                                                    {loadingId === request.id ? "..." : "Reject"}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    No enrollment requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

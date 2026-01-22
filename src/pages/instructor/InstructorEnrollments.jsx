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
    const filteredRequests = enrollmentRequests.filter(req => {
        const courseId = typeof req.course === 'object' ? req.course?.id : req.course;
        const matchesCourse = instructorCourseIds.includes(courseId);
        const matchesFilter = selectedCourse === "all" || courseId === parseInt(selectedCourse);
        return matchesCourse && matchesFilter;
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
                    <p className="text-gray-400">Manage student enrollment requests for your courses</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="text-2xl font-bold text-white">{filteredRequests.length}</div>
                    <div className="text-sm text-gray-400">Total Requests</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
                    <div className="text-sm text-gray-400">Pending</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-500">
                        {filteredRequests.filter(r => r.status === "APPROVED").length}
                    </div>
                    <div className="text-sm text-gray-400">Approved</div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs font-semibold text-gray-400 uppercase">
                            <th className="p-4">Course</th>
                            <th className="p-4">Requested</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="p-4">
                                        <span className="font-medium text-white">
                                            {getCourseTitle(request.course)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {request.requested_at
                                            ? new Date(request.requested_at).toLocaleDateString()
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
                                    <td className="p-4 text-right">
                                        {request.status === "PENDING" && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(request.id, "approve")}
                                                    disabled={loadingId === request.id}
                                                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                                                >
                                                    {loadingId === request.id ? "..." : "Approve"}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, "reject")}
                                                    disabled={loadingId === request.id}
                                                    className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
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

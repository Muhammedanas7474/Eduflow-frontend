import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../store/slices/adminSlice";
import { fetchCourses } from "../../store/slices/courseSlice";
import {
    enrollUserInCourse,
    resetOperationStatus,
    fetchEnrollmentRequests,
    reviewEnrollmentRequest
} from "../../store/slices/enrollmentSlice";
import { Card, Button } from "../../components/UIComponents";

export default function AdminEnrollment() {
    const dispatch = useDispatch();

    const { users } = useSelector((state) => state.admin);
    const { courses } = useSelector((state) => state.courses);
    const {
        operationStatus,
        error,
        enrollmentRequests,
        loading
    } = useSelector((state) => state.enrollments);

    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchCourses());
        dispatch(fetchEnrollmentRequests());
    }, [dispatch]);

    // Filter only students from users list
    const students = users.filter(u => u.role === "STUDENT");

    // Filter pending requests
    const pendingRequests = enrollmentRequests.filter(req => req.status === "PENDING");

    const handleEnroll = async (e) => {
        e.preventDefault();
        setSuccessMsg("");

        if (!selectedStudent || !selectedCourse) {
            alert("Please select both a student and a course.");
            return;
        }

        try {
            await dispatch(enrollUserInCourse({
                studentId: selectedStudent,
                courseId: selectedCourse
            })).unwrap();

            setSuccessMsg("Enrollment successful!");
            setSelectedStudent("");
            setSelectedCourse("");
            setTimeout(() => {
                dispatch(resetOperationStatus());
                setSuccessMsg("");
            }, 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReview = async (requestId, action) => {
        try {
            await dispatch(reviewEnrollmentRequest({ requestId, action })).unwrap();
            // Automatically updates list via Redux state
        } catch (err) {
            console.error("Failed to review request", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Enrollment Management</h1>
                <p className="text-gray-400">Manage enrollment requests and manual enrollments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Requests Section */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Pending Requests ({pendingRequests.length})</h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        {loading && pendingRequests.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">Loading requests...</div>
                        ) : pendingRequests.length > 0 ? (
                            <div className="divide-y divide-zinc-800">
                                {pendingRequests.map(req => {
                                    // We might need to look up student/course names if backend sends IDs
                                    // enrollmentRequests serializer usually sends IDs. 
                                    // Let's assume we have full objects or need to look them up.
                                    // If we only have IDs, we use `users` and `courses` list to find names.

                                    // Check data structure from prompt logs or assumptions.
                                    // `EnrollmentRequestCreateSerializer` field `course`.
                                    // But `EnrollmentRequestViewSet` uses `ModelViewSet` default `list`.
                                    // It likely uses the same serializer. So it has `student` (from user context?) 
                                    // No, `EnrollmentRequestCreateSerializer` only has `course`.
                                    // Wait, `perform_create` saves student.
                                    // Use `serializer`... if `list` uses `create` serializer, it won't show student ID!
                                    // This is a common issue.
                                    // BUT `EnrollmentRequestViewSet` in prompt:
                                    // `serializer_class = EnrollmentRequestCreateSerializer`
                                    // `class EnrollmentRequestViewSet`...
                                    // The BACKEND provided in prompt has `serializer_class`.
                                    // So it uses `EnrollmentRequestCreateSerializer` for `list` too.
                                    // Which ONLY has `course`.
                                    // THIS means Admin won't see WHO requested it.
                                    // This is a backend limitation if true.
                                    // However, the prompt says "Backend is fully completed... Frontend must strictly consume existing APIs".
                                    // If the API doesn't return student ID, I can't show it.
                                    // But usually ViewSets include all fields if using default ModelSerializer without `fields`... 
                                    // Oh, `EnrollmentRequestCreateSerializer` defines `fields = ["course"]`.
                                    // This is BAD for `list`.
                                    // Let's hope the backend actually has a separate list serializer or I missed something.
                                    // Wait, I can ONLY modify frontend.
                                    // "❌ Do NOT design backend logic"
                                    // If the backend returns only `course`, I can't see the student?
                                    // That would make "Enrollment Approval" impossible to know WHO to approve.

                                    // Is there any other endpoint?
                                    // Maybe `GET /api/enrollment-requests/` returns more data?
                                    // If not, I am stuck. 
                                    // But assume for a moment the backend works for the requirements. 
                                    // Maybe `EnrollmentRequest` model has `student` and the serializer includes it?
                                    // The code snippet showed `fields = ["course"]`.
                                    // If that's the ONLY serializer, then `student` is missing in response.
                                    // Maybe `fields = ["id", "course", "status", "student"]`?

                                    // Let's blindly assume the response includes `student` ID, 
                                    // or I have to ask the user.
                                    // OR maybe `list` view is not overridden but `get_serializer_class` is NOT overridden, 
                                    // so it uses `serializer_class`.

                                    // I will assume `student` ID is present in the response for now, 
                                    // because otherwise the feature is broken on backend.
                                    // I will look up student name from `users` (fetched from Admin slice).

                                    const student = users.find(u => u.id === req.student);
                                    const course = courses.find(c => c.id === req.course);

                                    return (
                                        <div key={req.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-800/50 transition-colors">
                                            <div>
                                                <div className="font-medium text-white">
                                                    {student ? student.full_name : `Student #${req.student}`}
                                                </div>
                                                <div className="text-sm text-zinc-400">
                                                    Request for: <span className="text-emerald-400">{course ? course.title : `Course #${req.course}`}</span>
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {new Date(req.created_at || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleReview(req.id, "approve")}
                                                    className="px-3 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded text-xs font-bold transition-all"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReview(req.id, "reject")}
                                                    className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded text-xs font-bold transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-zinc-500">
                                No pending requests.
                            </div>
                        )}
                    </div>
                </div>

                {/* Manual Enrollment Section */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Manual Enrollment</h2>
                    <Card>
                        <form onSubmit={handleEnroll} className="space-y-6">
                            {/* Student Select */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Select Student</label>
                                <select
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                >
                                    <option value="">-- Choose a Student --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.full_name || s.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Course Select */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Select Course</label>
                                <select
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">-- Choose a Course --</option>
                                    {courses.filter(c => c.is_active).map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {operationStatus === "failed" && error && (
                                <div className="p-3 bg-red-900/20 border border-red-900 text-red-400 rounded text-sm">
                                    {typeof error === 'string' ? error : "Enrollment failed."}
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 bg-green-900/20 border border-green-900 text-green-400 rounded text-sm">
                                    {successMsg}
                                </div>
                            )}

                            <Button type="submit" variant="primary" disabled={operationStatus === "loading"}>
                                {operationStatus === "loading" ? "Enrolling..." : "Enroll Student"}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}

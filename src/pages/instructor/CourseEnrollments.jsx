import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchCourseEnrollments } from "../../store/slices/enrollmentSlice";
import { fetchCourseById } from "../../store/slices/courseSlice";

export default function CourseEnrollments() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { courseEnrollments, loading, error } = useSelector((state) => state.enrollments);
    const { currentCourse } = useSelector((state) => state.courses);

    useEffect(() => {
        if (id) {
            dispatch(fetchCourseEnrollments(id));
            if (!currentCourse || currentCourse.id !== parseInt(id)) {
                dispatch(fetchCourseById(id));
            }
        }
    }, [dispatch, id, currentCourse]);

    if (loading && courseEnrollments.length === 0) {
        return <div className="text-center text-zinc-400 mt-10">Loading enrollments...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <Link to={`/instructor/courses/${id}`} className="text-zinc-500 hover:text-white mb-2 inline-block">
                    &larr; Back to Course
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Enrolled Students
                </h1>
                <p className="text-zinc-400">
                    {currentCourse?.title}
                </p>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="py-4 px-6 text-sm font-medium text-zinc-400">Student Name</th>
                            <th className="py-4 px-6 text-sm font-medium text-zinc-400">Phone</th>
                            <th className="py-4 px-6 text-sm font-medium text-zinc-400">Enrolled Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {courseEnrollments.length > 0 ? (
                            courseEnrollments.map((student) => (
                                <tr key={student.student_id} className="hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-4 px-6 text-white font-medium">
                                        {student.student_name}
                                    </td>
                                    <td className="py-4 px-6 text-zinc-400">
                                        {student.student_phone || "N/A"}
                                    </td>
                                    <td className="py-4 px-6 text-zinc-400">
                                        {new Date(student.enrolled_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-8 text-center text-zinc-500">
                                    No students enrolled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

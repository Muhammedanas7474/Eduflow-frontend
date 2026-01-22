import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchMyEnrollments } from "../../store/slices/enrollmentSlice";
import { fetchCourses } from "../../store/slices/courseSlice";

export default function MyCourses() {
    const dispatch = useDispatch();
    const { myEnrollments, loading, error } = useSelector(
        (state) => state.enrollments
    );

    useEffect(() => {
        dispatch(fetchMyEnrollments());
        dispatch(fetchCourses());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-zinc-400">
                Loading courses...
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-white mb-8">My Courses</h1>

            {myEnrollments.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-zinc-400 mb-4">You are not enrolled in any courses yet.</p>
                    <Link
                        to="/student/enrollment-requests"
                        className="text-emerald-500 hover:text-emerald-400 font-medium"
                    >
                        Browse available courses &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myEnrollments.map((enrollment) => (
                        <Link
                            key={enrollment.id || enrollment.course} // Fallback if id missing
                            to={`/student/courses/${enrollment.course}`}
                            // We might need to fetch course details if the enrollment API only returns IDs
                            // But based on common patterns, it might return the course object or we need to look it up.
                            // Let's assume for now it returns just ID as per serializer `course: enrollment.course.id`
                            // Wait, the serializer in the prompt says:
                            // data={ "id": enrollment.id, "student": enrollment.student.id, "course": enrollment.course.id }
                            // This is for create response. 
                            // For list response: `serializer = self.get_serializer(queryset, many=True)`
                            // And `EnrollmentCreateSerializer` fields are `['student', 'course']`. 
                            // It seems it might just return IDs. This is problematic for UI.
                            // I should check `EnrollmentCreateSerializer` in the prompt output again.
                            // It inherits from ModelSerializer.
                            // If I need course details (title, description), I might need to fetch courses separately or 
                            // the backend serializer might be simple. 
                            // The prompt provided backend code:
                            // class EnrollmentCreateSerializer(serializers.ModelSerializer):
                            //     class Meta: ... fields = ["student", "course"]
                            // This likely returns IDs.
                            // However, `EnrollmentViewSet.list` uses `get_serializer`.
                            // I might need to fetch all courses and map them, or the backend should have a different serializer for list.
                            // The prompt says "Frontend must strictly consume existing APIs".
                            // If the API only returns IDs, I have to work with that.
                            // Maybe I can fetch the course list (if I have access) or get course details.
                            // Use `fetchCourseDetails` if possible?
                            // Or maybe `course` field returns more info?

                            // Let's look at `EnrollmentViewSet`: 
                            // `serializer = self.get_serializer(queryset, many=True)`
                            // `get_serializer_class` always returns `EnrollmentCreateSerializer`.
                            // So it sends IDs.

                            // So I have a list of course IDs.
                            // I probably need to fetch the course details for these IDs.
                            // BUT `CourseViewSet` allows `IsAuthenticated` but filters by `tenant`.
                            // It seems I can list courses.

                            // Modified plan: In `MyCourses`, also fetch all courses (cached in courseSlice?) to show titles.
                            // Or better, component should fetch course details for each enrollment? No that's N+1.
                            // I should fetch all courses and filter, or match.

                            // Let's assume I can fetch all courses using `fetchCourses` from `courseSlice`.
                            // Then find the course info.

                            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group"
                        >
                            {/* 
                  Since I don't have the course title yet (only ID), 
                  I will create a sub-component or logic to display it.
                  Reviewing `courseSlice` might be useful.
               */}
                            <CourseCardContent courseId={enrollment.course} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// Sub-component to handle fetching course details if needed or looking up from store
function CourseCardContent({ courseId }) {
    const courses = useSelector(state => state.courses.courses);
    const dispatch = useDispatch();

    // We might need to ensure courses are loaded.
    // If we rely on generic `fetchCourses`, it might fetching ALL courses.
    // Let's blindly display ID for now if not found, or "Loading...".

    // Actually, `CourseViewSet` filters by tenant. So `fetchCourses` should return all courses available in the tenant.
    // Which matches what we need.

    const course = courses.find(c => c.id === courseId);

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {course ? course.title : `Course #${courseId}`}
            </h3>
            <p className="text-zinc-400 text-sm line-clamp-2">
                {course ? course.description : "Loading course details..."}
            </p>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                    ENROLLED
                </span>
                <span className="text-zinc-500 text-sm">
                    View Lessons &rarr;
                </span>
            </div>
        </div>
    )
}

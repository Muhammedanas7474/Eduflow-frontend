import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCourses, createNewCourse } from "../../store/slices/courseSlice";
import { Card, Button, Input } from "../../components/UIComponents"; // Assuming Modal exists or I need to create simple modal logic
import Navbar from "../../components/Navbar";

export default function CourseList() {
    const dispatch = useDispatch();
    const { courses, status, operationStatus } = useSelector((state) => state.courses);
    const [showModal, setShowModal] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState("");
    const [newCourseDescription, setNewCourseDescription] = useState("");

    useEffect(() => {
        dispatch(fetchCourses());
    }, [dispatch]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createNewCourse({
                title: newCourseTitle,
                description: newCourseDescription,
                is_active: true // default
            })).unwrap();
            setShowModal(false);
            setNewCourseTitle("");
            setNewCourseDescription("");
        } catch (err) {
            alert("Failed to create course");
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black pt-24 px-6 pb-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">
                            My <span className="text-neon">Courses</span>
                        </h1>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            + Create Course
                        </Button>
                    </div>

                    {status === "loading" && <p className="text-gray-400">Loading courses...</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} title={course.title} className="hover:border-neon transition-colors group">
                                <p className="text-gray-400 mb-4 line-clamp-2">
                                    {course.description || "No description provided."}
                                </p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className={`text-xs px-2 py-1 rounded ${course.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {course.is_active ? "Active" : "Draft"}
                                    </span>
                                    <Link to={`/instructor/courses/${course.id}`}>
                                        <Button variant="outline" className="!text-xs !py-1.5 !px-3">
                                            Manage
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {status === "succeeded" && courses.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            You haven't created any courses yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Simple Modal Implementation */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card title="Create New Course" className="w-full max-w-md relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <form onSubmit={handleCreateCourse}>
                            <Input
                                label="Course Title"
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                                required
                            />
                            <div className="mb-6">
                                <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-neon transition-colors"
                                    rows="3"
                                    value={newCourseDescription}
                                    onChange={(e) => setNewCourseDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <Button type="submit" variant="primary" disabled={operationStatus === "loading"}>
                                {operationStatus === "loading" ? "Creating..." : "Create Course"}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}

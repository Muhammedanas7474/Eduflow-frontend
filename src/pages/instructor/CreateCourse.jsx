import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createNewCourse } from "../../store/slices/courseSlice";

export default function CreateCourse() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { operationStatus, error } = useSelector((state) => state.courses);

    const [form, setForm] = useState({
        title: "",
        description: "",
        is_active: true,
    });

    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setToast({ type: "error", message: "Course title is required" });
            return;
        }

        try {
            const result = await dispatch(createNewCourse(form)).unwrap();
            setToast({ type: "success", message: "Course created successfully!" });

            // Navigate to the course detail page after short delay
            setTimeout(() => {
                navigate(`/instructor/courses/${result.id}`);
            }, 1000);
        } catch (err) {
            const errMsg = typeof err === "string" ? err : "Failed to create course";
            setToast({ type: "error", message: errMsg });
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg max-w-sm ${toast.type === "success"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {toast.type === "success" ? <span>✓</span> : <span>✕</span>}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/instructor/courses"
                    className="text-zinc-400 hover:text-white transition-colors text-sm mb-4 inline-block"
                >
                    ← Back to Courses
                </Link>
                <h1 className="text-3xl font-bold text-white">Create New Course</h1>
                <p className="text-zinc-400 mt-2">
                    Fill in the details below to create a new course. You can add lessons after creation.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Course Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Introduction to Web Development"
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Describe what students will learn in this course..."
                            rows={4}
                            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                        />
                    </div>

                    {/* Publish Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <div>
                            <h3 className="text-white font-medium">Publish Course</h3>
                            <p className="text-zinc-400 text-sm mt-1">
                                Make this course visible after admin approval
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-yellow-500 mt-0.5">⚠</span>
                            <div>
                                <h4 className="text-yellow-500 font-medium text-sm">Requires Admin Approval</h4>
                                <p className="text-yellow-500/80 text-xs mt-1">
                                    New courses require admin approval before students can see them.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={operationStatus === "loading"}
                        className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                    >
                        {operationStatus === "loading" ? "Creating..." : "Create Course"}
                    </button>
                    <Link
                        to="/instructor/courses"
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

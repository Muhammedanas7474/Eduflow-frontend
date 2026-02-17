import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
    fetchCourseById,
    fetchLessons,
    createNewLesson,
    updateExistingLesson,
    removeLesson,
    clearCurrentCourse,
    updateExistingCourse,
} from "../../store/slices/courseSlice";
import { getPresignedUrl, uploadToS3 } from "../../api/upload.api";
import { generateQuizFromPDF, getCourseQuizzes } from "../../api/quiz.api";
import { Card, Button, Input } from "../../components/UIComponents";
import Navbar from "../../components/Navbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/ToastContext";
import LessonResourcesModal from "../../components/instructor/LessonResourcesModal";

export default function CourseDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const toast = useToast();
    const { currentCourse, lessons, status, operationStatus } = useSelector((state) => state.courses);

    const [showLessonModal, setShowLessonModal] = useState(false);
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonVideoUrl, setLessonVideoUrl] = useState("");

    // Upload State
    const [uploadMode, setUploadMode] = useState("url"); // 'url' | 'file'
    const [lessonFile, setLessonFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);



    const [lessonOrder, setLessonOrder] = useState("");

    // State to track which lesson's video is currently playing
    const [playingLessonId, setPlayingLessonId] = useState(null);

    // Confirm dialog state
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, lessonId: null });

    // Course edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const [editLoading, setEditLoading] = useState(false);

    // Resource Modal State
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [resourceLesson, setResourceLesson] = useState(null);

    // AI Quiz State
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizGenerating, setQuizGenerating] = useState(false);
    const [quizNumQuestions, setQuizNumQuestions] = useState(5);
    const [quizzes, setQuizzes] = useState([]);
    const [quizzesLoading, setQuizzesLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchCourseById(id));
        dispatch(fetchLessons(id));
        loadQuizzes();

        return () => {
            dispatch(clearCurrentCourse());
        };
    }, [dispatch, id]);

    const loadQuizzes = async () => {
        try {
            setQuizzesLoading(true);
            const res = await getCourseQuizzes(id);
            setQuizzes(res.data);
        } catch (err) {
            console.error("Failed to load quizzes:", err);
        } finally {
            setQuizzesLoading(false);
        }
    };

    // Collect all PDF resources from all lessons
    const getPdfResources = () => {
        const pdfs = [];
        lessons.forEach((lesson) => {
            if (lesson.resources) {
                lesson.resources.forEach((res) => {
                    if (
                        res.file_type !== "link" &&
                        (res.file_url?.endsWith(".pdf") || res.file_type?.includes("pdf"))
                    ) {
                        pdfs.push({ ...res, lessonTitle: lesson.title });
                    }
                });
            }
        });
        return pdfs;
    };

    const [selectedPdfKey, setSelectedPdfKey] = useState("");

    const handleGenerateQuiz = async () => {
        if (!selectedPdfKey) {
            toast.error("Please select a PDF resource.");
            return;
        }

        setQuizGenerating(true);
        try {
            // Extract S3 key from full URL
            let pdfKey = selectedPdfKey;
            // If it's a full S3 URL, extract just the key
            const s3Match = pdfKey.match(/\.amazonaws\.com\/(.+)$/);
            if (s3Match) pdfKey = decodeURIComponent(s3Match[1]);

            await generateQuizFromPDF(id, pdfKey, quizNumQuestions);
            toast.success("Quiz generated successfully!");
            setShowQuizModal(false);
            setSelectedPdfKey("");
            loadQuizzes();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "Failed to generate quiz.";
            toast.error(msg);
        } finally {
            setQuizGenerating(false);
        }
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        try {
            if (!lessonVideoUrl.trim()) {
                alert("Video URL is required. Please enter a URL or upload a file.");
                return;
            }

            const lessonData = {
                course: id,
                title: lessonTitle,
                order: parseInt(lessonOrder) || 0,
                is_active: true,
                video_url: lessonVideoUrl
            };

            const result = await dispatch(createNewLesson(lessonData)).unwrap();

            // Success handling
            if (result) {
                alert("Lesson created successfully");
                dispatch(fetchLessons(id)); // Immediate refetch
                setShowLessonModal(false);
                resetForm();
            }
        } catch (err) {
            console.error("Failed to create lesson:", err);
            const errMsg = typeof err === 'object' ? JSON.stringify(err, null, 2) : err;
            alert(`Failed to create lesson: ${errMsg}`);
        }
    };

    const resetForm = () => {
        setLessonTitle("");
        setLessonVideoUrl("");
        setLessonOrder("");
        setLessonFile(null);
        setUploadMode("url");
        setUploading(false);
        setUploadProgress(0);
        setUploadError(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Sanitize file name to avoid S3 Signature encoding issues
            const sanitizedFile = new File([file], file.name.replace(/\s+/g, "_"), { type: file.type });
            setLessonFile(sanitizedFile);
            setUploadError(null);
            setUploadProgress(0);
            setLessonVideoUrl("");
        }
    };

    const handleUpload = async () => {
        if (!lessonFile) return;

        setUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        try {
            // 1. Get Presigned URL
            const presignRes = await getPresignedUrl(lessonFile.name, lessonFile.type);
            const { upload_url, file_url } = presignRes.data;

            // 2. Upload to S3
            await uploadToS3(upload_url, lessonFile, (percent) => {
                setUploadProgress(percent);
            });

            // 3. Set URL
            setLessonVideoUrl(file_url);
            setUploading(false);

        } catch (err) {
            console.error("Upload failed", err);
            setUploadError("Upload failed. Please try again.");
            setUploading(false);
        }
    };

    const openResourceModal = (lesson) => {
        setResourceLesson(lesson);
        setShowResourceModal(true);
    };

    // Open delete confirmation dialog
    const handleDeleteLesson = (lessonId) => {
        setDeleteConfirm({ open: true, lessonId });
    };

    // Confirm deletion
    const confirmDeleteLesson = async () => {
        if (deleteConfirm.lessonId) {
            await dispatch(removeLesson(deleteConfirm.lessonId));
            toast.success("Lesson deleted successfully");
        }
        setDeleteConfirm({ open: false, lessonId: null });
    };

    // Open course edit modal
    const openEditModal = () => {
        setEditTitle(currentCourse?.title || "");
        setEditDescription(currentCourse?.description || "");
        setEditIsActive(currentCourse?.is_active ?? true);
        setShowEditModal(true);
    };

    // Handle course update
    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await dispatch(updateExistingCourse({
                id,
                data: {
                    title: editTitle,
                    description: editDescription,
                    is_active: editIsActive,
                }
            })).unwrap();
            toast.success("Course updated successfully");
            setShowEditModal(false);
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update course");
        } finally {
            setEditLoading(false);
        }
    };

    if (status === "loading") {
        return <div className="min-h-screen bg-black pt-24 px-6 text-white">Loading course details...</div>;
    }

    if (!currentCourse && status === "succeeded") {
        return <div className="min-h-screen bg-black pt-24 px-6 text-white">Course not found.</div>;
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black pt-24 px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/instructor/courses" className="text-gray-400 hover:text-white mb-4 block">
                            &larr; Back to Courses
                        </Link>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {currentCourse?.title}
                                </h1>
                                <p className="text-gray-400 max-w-2xl">{currentCourse?.description}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={openEditModal}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700 font-medium"
                                >
                                    Edit Course
                                </button>
                                <Button variant="primary" onClick={() => setShowLessonModal(true)}>
                                    + Add Lesson
                                </Button>
                                <button
                                    onClick={() => setShowQuizModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
                                >
                                    🤖 Generate AI Quiz
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <Link to={`/instructor/courses/${id}/enrollments`}>
                                <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700 font-medium text-sm">
                                    View Enrollments
                                </button>
                            </Link>
                            <Link to={`/instructor/courses/${id}/progress`}>
                                <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700 font-medium text-sm">
                                    View Progress
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lessons List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4">Lessons</h2>
                            {lessons.length === 0 && (
                                <div className="text-gray-500 italic p-4 border border-zinc-800 rounded bg-zinc-900/30">
                                    No lessons added yet.
                                </div>
                            )}
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg group hover:border-zinc-700 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-neon font-mono font-bold">
                                                {lesson.order}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">{lesson.title}</h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPlayingLessonId(playingLessonId === lesson.id ? null : lesson.id)}
                                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded transition-colors border border-zinc-700"
                                            >
                                                {playingLessonId === lesson.id ? "Hide Video" : "Watch Video"}
                                            </button>
                                            <button
                                                onClick={() => openResourceModal(lesson)}
                                                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded transition-colors ml-2 border border-zinc-700 flex items-center gap-1"
                                            >
                                                <span>📚</span> Resources ({lesson.resources ? lesson.resources.length : 0})
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="text-red-500 hover:text-red-400 text-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Video Player */}
                                    {playingLessonId === lesson.id && (
                                        <div className="mt-4 bg-black rounded overflow-hidden aspect-video">
                                            <video
                                                controls
                                                className="w-full h-full"
                                                src={lesson.video_url}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* AI Quizzes Section */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    🤖 AI Quizzes
                                    {quizzesLoading && (
                                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </h2>

                                {quizzes.length === 0 && !quizzesLoading && (
                                    <div className="text-gray-500 italic p-4 border border-zinc-800 rounded bg-zinc-900/30">
                                        No quizzes generated yet. Click "Generate AI Quiz" to create one from a PDF resource.
                                    </div>
                                )}

                                {quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        to={`/instructor/courses/${id}/quiz/${quiz.id}`}
                                        className="block mb-3 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 p-4 rounded-lg hover:border-purple-500/40 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                                                    {quiz.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {quiz.questions?.length || 0} questions · Created {new Date(quiz.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="text-gray-600 group-hover:text-purple-400 transition-colors text-lg">→</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Course Stats / Info Sidebar */}
                        <div>
                            <Card title="Course Info">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status</span>
                                        <span className={currentCourse?.is_active ? "text-neon" : "text-red-500"}>
                                            {currentCourse?.is_active ? "Active" : "Draft"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Lessons</span>
                                        <span className="text-white">{lessons.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Created</span>
                                        <span className="text-white">
                                            {new Date(currentCourse?.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Lesson Modal */}
            {showLessonModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card title="Add New Lesson" className="w-full max-w-md relative">
                        <button
                            onClick={() => setShowLessonModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <form onSubmit={handleCreateLesson}>
                            <Input
                                label="Lesson Title"
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                                required
                            />

                            <div className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setUploadMode("url")}
                                    className={`text-sm font-medium pb-1 ${uploadMode === "url" ? "text-neon border-b-2 border-neon" : "text-gray-400 hover:text-white"}`}
                                >
                                    Video URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMode("file")}
                                    className={`text-sm font-medium pb-1 ${uploadMode === "file" ? "text-neon border-b-2 border-neon" : "text-gray-400 hover:text-white"}`}
                                >
                                    Upload File
                                </button>
                            </div>

                            {/* Video URL Input */}
                            <div className="mb-4">
                                {uploadMode === 'url' ? (
                                    <Input
                                        label="Video URL (YouTube / External)"
                                        placeholder="https://..."
                                        value={lessonVideoUrl}
                                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                                        required={uploadMode === 'url'}
                                        disabled={uploading}
                                    />
                                ) : (
                                    <div>
                                        <label className="block text-gray-400 text-sm font-medium mb-2">Video File (MP4)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                accept="video/mp4,video/*"
                                                className="block w-full text-sm text-gray-400
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-zinc-800 file:text-neon
                                                    hover:file:bg-zinc-700
                                                "
                                                onChange={handleFileSelect}
                                                disabled={uploading}
                                            />
                                            {lessonFile && !lessonVideoUrl && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleUpload}
                                                    disabled={uploading}
                                                    className="shrink-0"
                                                >
                                                    {uploading ? `${uploadProgress}%` : "Upload"}
                                                </Button>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        {uploading && (
                                            <div className="w-full bg-zinc-800 rounded-full h-2.5 mt-2">
                                                <div
                                                    className="bg-neon h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        {/* Error / Success Message */}
                                        {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                                        {lessonVideoUrl && uploadMode === 'file' && (
                                            <p className="text-neon text-xs mt-1">✓ Upload complete. Ready to create lesson.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Order / Sequence Number"
                                type="number"
                                value={lessonOrder}
                                onChange={(e) => setLessonOrder(e.target.value)}
                                className="w-24"
                                disabled={uploading}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={operationStatus === "loading" || uploading || !lessonVideoUrl}
                            >
                                {operationStatus === "loading" ? "Creating..." : "Add Lesson"}
                            </Button>
                            {operationStatus === "failed" && (
                                <p className="text-red-500 text-sm mt-2 text-center">Check alert for details or try again.</p>
                            )}
                        </form>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, lessonId: null })}
                onConfirm={confirmDeleteLesson}
                title="Delete Lesson"
                message="Are you sure you want to delete this lesson? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            {/* Edit Course Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card title="Edit Course" className="w-full max-w-md relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <form onSubmit={handleUpdateCourse}>
                            <Input
                                label="Course Title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4">
                                <span className="text-white">Published</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editIsActive}
                                        onChange={(e) => setEditIsActive(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <Button type="submit" variant="primary" disabled={editLoading}>
                                {editLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </Card>
                </div>
            )}


            {/* Resource Modal */}
            {showResourceModal && resourceLesson && (
                <LessonResourcesModal
                    lesson={resourceLesson}
                    onClose={() => {
                        setShowResourceModal(false);
                        setResourceLesson(null);
                    }}
                />
            )}

            {/* AI Quiz Generation Modal */}
            {showQuizModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <Card title="Generate AI Quiz" className="w-full max-w-md relative">
                        <button
                            onClick={() => setShowQuizModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="space-y-5">
                            <p className="text-gray-400 text-sm">
                                Select a PDF resource from your lessons. The AI will read it and generate a multiple-choice quiz.
                            </p>

                            {/* PDF Selector */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">PDF Resource</label>
                                {getPdfResources().length === 0 ? (
                                    <p className="text-yellow-500 text-sm bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                        ⚠️ No PDF resources found. Upload a PDF to a lesson's resources first.
                                    </p>
                                ) : (
                                    <select
                                        value={selectedPdfKey}
                                        onChange={(e) => setSelectedPdfKey(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="">Select a PDF…</option>
                                        {getPdfResources().map((pdf) => (
                                            <option key={pdf.id} value={pdf.file_url}>
                                                {pdf.title} (from: {pdf.lessonTitle})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Number of Questions */}
                            <div>
                                <label className="block text-gray-400 text-sm font-medium mb-2">Number of Questions</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={quizNumQuestions}
                                    onChange={(e) => setQuizNumQuestions(parseInt(e.target.value) || 5)}
                                    className="w-24 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={quizGenerating || !selectedPdfKey}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                {quizGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Generating… This may take a minute
                                    </>
                                ) : (
                                    <>🤖 Generate Quiz</>
                                )}
                            </button>
                        </div>
                    </Card>
                </div>
            )}

        </>
    );
}

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { attachResourceToLesson, detachResourceFromLesson } from "../../store/slices/courseSlice";
import { getPresignedUrl, uploadToS3 } from "../../api/upload.api";
import { Card, Button, Input } from "../UIComponents";
import { useToast } from "../ToastContext";

export default function LessonResourcesModal({ lesson, onClose }) {
    const dispatch = useDispatch();
    const toast = useToast();

    const [resourceType, setResourceType] = useState("file"); // 'file' | 'link'
    const [linkUrl, setLinkUrl] = useState("");
    const [title, setTitle] = useState("");

    // File state
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Sanitize file name
            const sanitizedFile = new File([file], file.name.replace(/\s+/g, "_"), { type: file.type });
            setSelectedFile(sanitizedFile);
            if (!title) {
                setTitle(file.name.split('.')[0]);
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        // Validation
        if (!title) {
            alert("Please enter a title.");
            return;
        }
        if (resourceType === 'file' && !selectedFile) {
            alert("Please select a file.");
            return;
        }
        if (resourceType === 'link' && !linkUrl) {
            alert("Please enter a URL.");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            let finalUrl = linkUrl;
            let finalType = 'link';

            if (resourceType === 'file') {
                // 1. Get Presigned URL
                const presignRes = await getPresignedUrl(selectedFile.name, selectedFile.type);
                const { upload_url, file_url } = presignRes.data;

                // 2. Upload to S3
                await uploadToS3(upload_url, selectedFile, (percent) => {
                    setUploadProgress(percent);
                });

                finalUrl = file_url;
                finalType = selectedFile.type.split('/')[1] || 'document';
            }

            // 3. Create Resource Record
            await dispatch(attachResourceToLesson({
                lesson: lesson.id,
                title: title,
                file_url: finalUrl,
                file_type: finalType
            })).unwrap();

            toast.success("Resource added successfully");

            // RESET FORM
            setTitle("");
            setSelectedFile(null);
            setLinkUrl("");
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to add resource");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resourceId) => {
        if (confirm("Are you sure you want to delete this resource?")) {
            try {
                await dispatch(detachResourceFromLesson(resourceId)).unwrap();
                toast.success("Resource deleted");
            } catch (err) {
                toast.error("Failed to delete resource");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card title={`Resources for: ${lesson.title}`} className="w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <div className="space-y-6">
                    {/* List Existing Resources */}
                    <div>
                        <h3 className="text-white font-medium mb-3">Attached Resources</h3>
                        {lesson.resources && lesson.resources.length > 0 ? (
                            <ul className="space-y-2">
                                {lesson.resources.map((res) => (
                                    <li key={res.id} className="flex justify-between items-center bg-zinc-800/50 p-3 rounded border border-zinc-700">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-2xl text-gray-400">
                                                {res.file_type === 'link' ? '🔗' : '📄'}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate">{res.title}</p>
                                                <a
                                                    href={res.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-neon hover:underline truncate block"
                                                >
                                                    {res.file_type === 'link' ? 'Open Link' : 'Download File'}
                                                </a>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(res.id)}
                                            className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-zinc-700/50 transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No resources attached yet.</p>
                        )}
                    </div>

                    <div className="border-t border-zinc-700 my-4"></div>

                    {/* Add New Resource */}
                    <div>
                        <h3 className="text-white font-medium mb-3">Add New Resource</h3>

                        {/* Type Toggle */}
                        <div className="flex gap-4 mb-4 border-b border-zinc-800 pb-2">
                            <button
                                type="button"
                                onClick={() => setResourceType("file")}
                                className={`text-sm font-medium pb-1 ${resourceType === "file" ? "text-neon border-b-2 border-neon" : "text-gray-400 hover:text-white"}`}
                            >
                                Upload File
                            </button>
                            <button
                                type="button"
                                onClick={() => setResourceType("link")}
                                className={`text-sm font-medium pb-1 ${resourceType === "link" ? "text-neon border-b-2 border-neon" : "text-gray-400 hover:text-white"}`}
                            >
                                Link / URL
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-4">
                            <Input
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Lecture Slides or Reference Link"
                                required
                                disabled={uploading}
                            />

                            {resourceType === 'file' ? (
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">File</label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        className="block w-full text-sm text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-zinc-800 file:text-neon
                                            hover:file:bg-zinc-700
                                            cursor-pointer
                                        "
                                        disabled={uploading}
                                    />
                                </div>
                            ) : (
                                <Input
                                    label="External URL"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="https://example.com/article"
                                    required
                                    disabled={uploading}
                                />
                            )}

                            {uploading && resourceType === 'file' && (
                                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                    <div
                                        className="bg-neon h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={uploading || (!title) || (resourceType === 'file' && !selectedFile) || (resourceType === 'link' && !linkUrl)}
                                className="w-full"
                            >
                                {uploading ? `Uploading ${uploadProgress}%...` : "Add Resource"}
                            </Button>
                        </form>
                    </div>
                </div>
            </Card>
        </div>
    );
}

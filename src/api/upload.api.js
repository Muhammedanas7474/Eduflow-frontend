import api from "./axios";
import axios from "axios";

// 1. Get Presigned URL (Authenticated)
export const getPresignedUrl = async (fileName, contentType) => {
    const response = await api.post("/uploads/presign/", {
        file_name: fileName,
        content_type: contentType,
    });
    return response.data; // Expected: { success: true, data: { upload_url, file_url } }
};

// 2. Upload to S3 (Unauthenticated / Clean XHR)
export const uploadToS3 = async (uploadUrl, file, onProgress) => {
    return new Promise((resolve, reject) => {
        // PATCH: Fix S3 Region Mismatch (Global endpoint vs Regional Bucket)
        // If we use s3.amazonaws.com for a bucket in eu-north-1, we get 307 Redirects which break CORS.
        // Credential Format: <Key>/<Date>/<Region>/s3/aws4_request
        // Encoded: <Key>%2F<Date>%2F<Region>%2Fs3...
        // Previous regex failed because it missed the Date component.
        let macthedRegion = uploadUrl.match(/X-Amz-Credential=[^%]+%2F[^%]+%2F([a-z0-9-]+)%2Fs3/);
        let finalUrl = uploadUrl;

        if (macthedRegion && macthedRegion[1] && uploadUrl.includes("s3.amazonaws.com")) {
            const region = macthedRegion[1];
            finalUrl = uploadUrl.replace("s3.amazonaws.com", `s3.${region}.amazonaws.com`);
            console.log("Patched S3 URL to use regional endpoint:", finalUrl);
        }

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", finalUrl);

        // ONLY set the Content-Type. Do NOT set Authorization or custom headers.
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentCompleted = Math.round((event.loaded * 100) / event.total);
                onProgress(percentCompleted);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network Error (Possible CORS issue or connection failure)"));
        };

        xhr.send(file);
    });
};

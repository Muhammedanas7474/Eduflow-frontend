import axios from "axios";
import api from "./axios";
import { logout } from "../store/slices/authSlice";

// Token refresh queue to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const setupAxiosInterceptors = (store) => {
    // Add withCredentials to default instance
    api.defaults.withCredentials = true;

    api.interceptors.request.use(
        (config) => {
            // We no longer manually inject the token mechanism as it's handled by cookies
            // However, we might want to ensure we don't accidentally send an old generic header
            return config;
        },
        (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url.includes("login") &&
                !originalRequest.url.includes("register")
            ) {
                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(() => {
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const baseURL = api.defaults.baseURL;

                    // Call the cookie-based refresh endpoint
                    // We must pass withCredentials: true explicitly for the scratch instance if used,
                    // but here we can just use axios default with config
                    await axios.post(
                        `${baseURL}/accounts/token/refresh/`,
                        {},
                        { withCredentials: true }
                    );

                    // Successfully refreshed (cookies updated)
                    processQueue(null);

                    // Retry original request
                    return api(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    store.dispatch(logout());
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;

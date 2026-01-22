import axios from "axios";
import api from "./axios";
import { logout, updateAccessToken } from "../store/slices/authSlice";

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
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("access");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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
                !originalRequest._retry
            ) {
                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refresh = localStorage.getItem("refresh");

                    if (!refresh) {
                        throw new Error("No refresh token");
                    }

                    const baseURL = api.defaults.baseURL;
                    const res = await axios.post(
                        `${baseURL}/accounts/token/refresh/`,
                        { refresh }
                    );

                    const newToken = res.data.access;
                    localStorage.setItem("access", newToken);
                    store.dispatch(updateAccessToken(newToken));

                    processQueue(null, newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

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

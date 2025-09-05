"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
axios_1.default.defaults.withCredentials = true;
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
const api = axios_1.default.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "", // adjust if backend URL is different
    withCredentials: true,
});
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch((err) => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            await api.post("/api/users/refresh"); // refresh token call
            processQueue(null, null);
            return api(originalRequest);
        }
        catch (refreshError) {
            processQueue(refreshError, null);
            console.error("Refresh failed, logging out...");
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
            return Promise.reject(refreshError);
        }
        finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});
exports.default = api;

// src/api/http.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000",
});

// ================================
// Attach token to every request
// ================================
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ================================
// Handle 401 / 403 + lưu lý do
// ================================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      const url = error.config?.url || "";

      // ⚠️ BỎ QUA CHO LOGIN / REGISTER
      const isAuthRoute =
        url.includes("/api/auth/login") || url.includes("/api/auth/register");

      if (!isAuthRoute) {
        const msg = (error?.response?.data?.message || "").toLowerCase();

        let reason = "auth";
        const isLocked =
          status === 403 && (msg.includes("khóa") || msg.includes("khoá"));

        if (isLocked) {
          reason = "locked";
        } else if (status === 401) {
          reason = "expired";
        }

        localStorage.setItem("logoutReason", reason);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (isLocked) {
          window.location.href = "/login?locked=1";
        } else {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;

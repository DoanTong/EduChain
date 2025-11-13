// src/AppRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AdminDashboard from "./pages/manager/AdminDashboard.jsx";
import Verify from "./pages/verify/Verify.jsx";
import Login from "./pages/Auth/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// 🧩 Import Toastify global
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected: chỉ admin được phép vào */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ Popup toàn cục cho toàn bộ app */}
      <ToastContainer
        position="bottom-right"   // 👈 góc phải dưới
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        transition={Slide}        // 👈 hiệu ứng trượt
        theme="colored"           // 👈 màu sắc tự động (success, error, warning)
      />
    </BrowserRouter>
  );
}

export default AppRoutes;

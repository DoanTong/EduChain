// src/components/ProtectedRoute.jsx
import React, { useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const hasShownToast = useRef(false); // ✅ flag chống double popup

  if (loading) {
    return <div className="text-center py-10 text-gray-500">⏳ Đang kiểm tra quyền truy cập...</div>;
  }

  // ❌ Nếu chưa đăng nhập
  if (!user) {
    if (!hasShownToast.current) {
      toast.warning("Bạn cần đăng nhập để truy cập!");
      hasShownToast.current = true; // ✅ chỉ toast 1 lần
    }
    return <Navigate to="/login" replace />;
  }

  // ❌ Nếu không đủ quyền
  if (requireAdmin && user.role !== "admin") {
    if (!hasShownToast.current) {
      toast.error("Chức năng này chỉ dành cho quản trị viên!");
      hasShownToast.current = true;
    }
    return <Navigate to="/" replace />;
  }

  // ✅ Đủ quyền → render
  return children;
}

export default ProtectedRoute;

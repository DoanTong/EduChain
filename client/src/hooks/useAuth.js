// src/hooks/useAuth.js
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ trạng thái đang tải

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      // ✅ Nếu có token & user -> set ngay
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Lỗi đọc thông tin đăng nhập:", err);
      setUser(null);
    } finally {
      setLoading(false); // ✅ đánh dấu đã đọc xong
    }
  }, []);

  // ✅ Gọi khi đăng nhập thành công
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // ✅ Gọi khi đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, login, logout, loading };
}

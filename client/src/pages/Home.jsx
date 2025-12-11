import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

import GuestHome from "./GuestHome.jsx";
import UserHome from "./UserHome.jsx";
import AdminDashboard from "./manager/AdminDashboard.jsx";
import AdminHome from "./manager/AdminHome.jsx";

export default function Home() {
  const { user } = useAuth();

  // Chưa đăng nhập → Guest
  if (!user) return <GuestHome />;

  // Nếu là admin → load đúng trang admin
  if (user.role === "admin") return <AdminHome  />;

  // Còn lại là user bình thường
  return <UserHome />;
}

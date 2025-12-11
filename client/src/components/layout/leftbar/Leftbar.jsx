// import React from "react";
// import { NavLink, Link, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Settings,
//   LogOut,
//   LogIn,
//   ChevronLeft,
//   ChevronRight,
//   Users,
//   Shield,
//   Activity,
//   UserCheck,
//   ServerCog,
// } from "lucide-react";

// import { useSidebar } from "../../../context/SidebarContext";
// import { useAuth } from "../../../hooks/useAuth.js";
// import CreepyButton from "../../buttons/CreepyButton.jsx";
// import "./Leftbar.css";

// function Leftbar() {
//   const { collapsed, setCollapsed } = useSidebar();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <div className={`leftbar ${collapsed ? "collapsed" : ""}`}>

//       {/* TOP */}
//       <div className="leftbar-top">
//         {!collapsed && (
//           <Link to="/" className="leftbar-logo">
//             EduChain
//           </Link>
//         )}

//         <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
//           {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//         </button>
//       </div>

//       {/* MENU ZONE */}
//       <nav className="leftbar-menu">
//         {!user && <GuestMenu collapsed={collapsed} />}
//         {user && user.role !== "admin" && <UserMenu collapsed={collapsed} />}
//         {user && user.role === "admin" && <AdminSystemMenu collapsed={collapsed} />}
//       </nav>

//       {/* FOOTER */}
//       <div className="leftbar-footer">
//         {user ? (
//           <CreepyButton collapsed={collapsed} onClick={logout} color="red">
//             {!collapsed ? "Đăng xuất" : <LogOut size={18} />}
//           </CreepyButton>
//         ) : (
//           <CreepyButton collapsed={collapsed} onClick={() => navigate("/login")} color="blue">
//             {!collapsed ? "Đăng nhập" : <LogIn size={18} />}
//           </CreepyButton>
//         )}
//       </div>

//     </div>
//   );
// }

// /* ------------------------- MENU COMPONENTS --------------------------- */

// // ⭐ MENU CỦA USER THƯỜNG
// function UserMenu({ collapsed }) {
//   return (
//     <>
//       <NavItem to="/" icon={<Home />} text="Trang chủ" collapsed={collapsed} />
//       <NavItem to="/exam" icon={<Activity />} text="Bài thi" collapsed={collapsed} />
//       <NavItem to="/my-results" icon={<UserCheck />} text="Kết quả của tôi" collapsed={collapsed} />
//       <NavItem to="/my-certificates" icon={<Shield />} text="Chứng chỉ của tôi" collapsed={collapsed} />
//       <NavItem to="/profile" icon={<Users />} text="Tài khoản" collapsed={collapsed} />
//     </>
//   );
// }

// // 🔥 MENU CỦA ADMIN (QUẢN TRỊ HỆ THỐNG)
// function AdminSystemMenu({ collapsed }) {
//   return (
//     <>
//       <NavItem to="/admin" icon={<ServerCog />} text="Quản trị hệ thống" collapsed={collapsed} />
//       <NavItem to="/admin/users" icon={<Users />} text="Người dùng" collapsed={collapsed} />
//       <NavItem to="/admin/roles" icon={<Shield />} text="Phân quyền" collapsed={collapsed} />
//       <NavItem to="/admin/logs" icon={<Activity />} text="Nhật ký hoạt động" collapsed={collapsed} />
//       <NavItem to="/admin/online" icon={<UserCheck />} text="User đang online" collapsed={collapsed} />
//       <NavItem to="/admin/settings" icon={<Settings />} text="Cấu hình hệ thống" collapsed={collapsed} />
//     </>
//   );
// }

// // MENU GUEST
// function GuestMenu({ collapsed }) {
//   return <NavItem to="/" icon={<Home />} text="Trang chủ" collapsed={collapsed} />;
// }

// function NavItem({ to, icon, text, collapsed }) {
//   return (
//     <NavLink to={to} className="leftbar-item">
//       {icon}
//       {!collapsed && <span>{text}</span>}
//     </NavLink>
//   );
// }

// export default Leftbar;
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Settings,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  Activity,
  UserCheck,
  ServerCog,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext.jsx";
import CreepyButton from "../../buttons/CreepyButton.jsx";
import "./Leftbar.css";
function Leftbar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className={`leftbar ${collapsed ? "collapsed" : ""}`}>

      {/* TOP */}
      <div className="leftbar-top">
        {!collapsed && (
          <Link to="/" className="leftbar-logo">
            EduChain
          </Link>
        )}

        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="leftbar-menu">
        {!user && <GuestMenu collapsed={collapsed} />}
        {user && user.role !== "admin" && <UserMenu collapsed={collapsed} />}
        {user && user.role === "admin" && <AdminSystemMenu collapsed={collapsed} />}
      </nav>

      {/* FOOTER */}
      <div className="leftbar-footer">
        {user ? (
          <CreepyButton collapsed={collapsed} onClick={logout} color="red">
            {!collapsed ? "Đăng xuất" : <LogOut size={18} />}
          </CreepyButton>
        ) : (
          <CreepyButton collapsed={collapsed} onClick={() => navigate("/login")} color="blue">
            {!collapsed ? "Đăng nhập" : <LogIn size={18} />}
          </CreepyButton>
        )}
      </div>

    </div>
  );
}

/* ------------------------- MENU COMPONENTS --------------------------- */

/* ⭐ USER MENU */
function UserMenu({ collapsed }) {
  const [openExam, setOpenExam] = useState(false);

  return (
    <>
      <NavItem to="/" icon={<Home />} text="Trang chủ" collapsed={collapsed} />

      {/* MENU CHÍNH CÓ SUBMENU */}
      <div className="nav-group">
        <div
          className={`nav-item ${openExam ? "open" : ""}`}
          onClick={() => setOpenExam(!openExam)}
        >
          <span className="nav-icon"><Activity /></span>
          {!collapsed && <span className="nav-text">Luyện tập</span>}
          {!collapsed && (
            <span className="nav-arrow">
              {openExam ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </div>

        {/* SUBMENU */}
        {openExam && !collapsed && (
          <div className="submenu">
            <NavItem
              to="/exam/latest"
              icon={<Clock size={16} />}
              text="Bài thi mới nhất"
              collapsed={collapsed}
              isSub={true}
            />

            <NavItem
              to="/exam/history"
              icon={<CheckCircle size={16} />}
              text="Bài thi đã làm"
              collapsed={collapsed}
              isSub={true}
            />
          </div>
        )}
      </div>

      {/* <NavItem to="/my-results" icon={<UserCheck />} text="Kết quả của tôi" collapsed={collapsed} /> */}
      <NavItem to="/my-certificates" icon={<Shield />} text="Chứng chỉ của tôi" collapsed={collapsed} />
      <NavItem to="/profile" icon={<Users />} text="Tài khoản" collapsed={collapsed} />
    </>
  );
}

/* 🔥 ADMIN MENU */
function AdminSystemMenu({ collapsed }) {
  return (
    <>
      <NavItem to="/admin" icon={<ServerCog />} text="Quản trị hệ thống" collapsed={collapsed} />
      <NavItem to="/admin/users" icon={<Users />} text="Người dùng" collapsed={collapsed} />
      <NavItem to="/admin/roles" icon={<Shield />} text="Phân quyền" collapsed={collapsed} />
      {/* <NavItem to="/admin/logs" icon={<Activity />} text="Nhật ký hoạt động" collapsed={collapsed} /> */}
      <NavItem to="/admin/dashboard" icon={<UserCheck />} text="Bài thi" collapsed={collapsed} />
      {/* <NavItem to="/admin/settings" icon={<Settings />} text="Cấu hình hệ thống" collapsed={collapsed} /> */}
    </>
  );
}

/* GUEST MENU */
function GuestMenu({ collapsed }) {
  return <NavItem to="/" icon={<Home />} text="Trang chủ" collapsed={collapsed} />;
}

/* COMPONENT NAVITEM CHÍNH — KHÔNG DUPLICATE */
function NavItem({ to, icon, text, collapsed, isSub }) {
  return (
    <NavLink
      to={to}
      className={`leftbar-item ${isSub ? "sub-item" : ""}`}
    >
      <span className="nav-icon">{icon}</span>
      {!collapsed && <span>{text}</span>}
    </NavLink>
  );
}

export default Leftbar;

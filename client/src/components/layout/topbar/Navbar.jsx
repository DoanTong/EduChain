import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Sun,
  Moon,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";

import API from "../../../api/http.js";
import "./Navbar.css";
import { socket } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

function Navbar() {
  const { collapsed } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { inputText, setInputText, setKeyword, suggestions, setSuggestions, setUserSearch } =
    useSearch();

  const exams = JSON.parse(localStorage.getItem("allExams") || "[]");

  const [openUserMenu, setOpenUserMenu] = useState(false);

  // ================================
  // NOTIFICATIONS
  // ================================
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [openNoti, setOpenNoti] = useState(false);
  const notiRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();
  // LOAD NOTIFICATIONS
  const loadNotifications = async () => {
    if (!user?._id) return;

    try {
      const res = await API.get("/api/notifications/my");
      const list = res.data?.data || [];

      setNotifications(list);
      setUnread(list.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Notification load error:", err);
    }
  };

  // Load when login or refresh
  useEffect(() => {
    loadNotifications();
  }, [user]);

  // SOCKET REALTIME NEW NOTI
  useEffect(() => {
    socket.on("new-notification", (noti) => {
      if (noti.user !== user?._id) return; // Chỉ nhận đúng user

      setNotifications((prev) => [noti, ...prev]);
      setUnread((u) => u + 1);
    });

    return () => socket.off("new-notification");
  }, [user]);

  // MARK ONE READ
  const markAsRead = async (id) => {
    try {
      await API.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  // MARK ALL READ
  const markAllAsRead = async () => {
    try {
      await API.put("/api/notifications/mark-all-read");

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleNotiClick = (n) => {
    if (!n.read) markAsRead(n._id);

    if (n.type === "exam-session" && n.sessionId) {
      navigate(`/exam-session/${n.sessionId}`);
    }

    setOpenNoti(false);
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  // CLOSE DROPDOWNS WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setOpenNoti(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${collapsed ? "collapsed" : ""}`}>
      {/* SEARCH BAR */}
      <div className="navbar__search">
        <Search size={16} className="search-icon" />

        <input
          placeholder="Tìm bài thi..."
          value={inputText}
          onChange={(e) => {
            const value = e.target.value;
            setInputText(value);
            setUserSearch(value);

            const match = exams.filter((ex) =>
              ex.title.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(match.slice(0, 5));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setKeyword(inputText);
              setSuggestions([]);
            }
          }}
        />

        {inputText && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((s) => (
              <div
                key={s._id}
                className="suggestion-item"
                onClick={() => {
                  setInputText(s.title);
                  setKeyword(s.title);
                  setSuggestions([]);
                }}
              >
                <Search size={14} />
                {s.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="navbar__actions">
        {/* NOTIFICATION BELL */}
        <div className="notification-wrapper" ref={notiRef}>
          <button
            className={`icon-btn bell-btn ${unread > 0 ? "has-unread" : ""}`}
            onClick={() => setOpenNoti(!openNoti)}
          >
            <Bell size={20} />
            {unread > 0 && <span className="noti-badge">{unread}</span>}
          </button>

          {openNoti && (
            <div className="noti-dropdown enhanced">
              <div className="noti-header">
                <span>Thông báo</span>

                {unread > 0 && (
                  <button className="mark-read-btn" onClick={markAllAsRead}>
                    Đánh dấu tất cả
                  </button>
                )}
              </div>

              <div className="noti-list">
                {notifications.length === 0 ? (
                  <div className="noti-empty">Không có thông báo</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`noti-item ${!n.read ? "unread" : ""}`}
                      onClick={() => handleNotiClick(n)}
                    >
                      <div className="noti-title">
                        {!n.read && <span className="dot"></span>}
                        {n.title}
                      </div>

                      <div className="noti-msg">{n.message}</div>
                      <div className="noti-time">{timeAgo(n.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* DARK MODE */}
        <button
          className="icon-btn"
          onClick={() => {
            console.log("toggleTheme click", { isDark });
            toggleTheme();
          }}
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* USER MENU */}
        <div className="navbar__user">
          <button className="user-btn" onClick={() => setOpenUserMenu(!openUserMenu)}>
            <User size={18} />
            <span>{user?.name || "Tài khoản"}</span>
            <ChevronDown size={16} />
          </button>

          {openUserMenu && (
            <div className="user-menu">
              {user ? (
                <>
                  <Link className="user-menu-item" to="/profile">
                    <User size={14} /> Thông tin cá nhân
                  </Link>

                  <button className="user-menu-item" onClick={logout}>
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </>
              ) : (
                <Link className="user-menu-item" to="/login">
                  <User size={14} /> Đăng nhập
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

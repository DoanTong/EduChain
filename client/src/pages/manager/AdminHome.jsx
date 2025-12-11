import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Leftbar from "../../components/layout/leftbar/Leftbar";
import Navbar from "../../components/layout/topbar/Navbar";

import API from "../../api/http";
import { socket } from "../../context/AuthContext";

import PassRateBarChart from "../../components/charts/PassRateBarChart";
import ScorePieChart from "../../components/charts/ScorePieChart";
import TrendLineChart from "../../components/charts/TrendLineChart";

import { Users, FileCheck, Target, Award } from "lucide-react";
import RightPanel from "../../components/layout/rightpanel/RightPanel";

import "./AdminHome.css";
import { useSearch } from "../../context/SearchContext";

export default function AdminHome() {
  const navigate = useNavigate();

  const { userSearch } = useSearch(); // 🔥 NHẬN SEARCH TỪ NAVBAR

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [rightPanelTrigger, setRightPanelTrigger] = useState(0);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    avgScore: 0,
    passRate: 0,
  });

  const [chartData, setChartData] = useState([]);
  const reviewRef = useRef(null);

  const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // Resolve avatar
  const getAvatar = (u) => {
    if (!u) return "/default.png";
    if (u.avatar?.startsWith("/uploads")) return BASE + u.avatar;
    if (u.avatar?.startsWith("http")) return u.avatar;

    return (
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(u.name || "User") +
      "&background=2563eb&color=fff"
    );
  };

  // Load all users
  useEffect(() => {
    (async () => {
      const res = await API.get("/api/users/active-list");
      setAllUsers(res.data.data || []);
    })();
  }, []);

  // SOCKET REALTIME (online/offline)
  useEffect(() => {
    if (!socket) return;

    socket.on("online-users", (users) => setOnlineUsers(users || []));
    socket.on("user-online", (u) =>
      setOnlineUsers((prev) =>
        prev.some((x) => x._id === u._id) ? prev : [...prev, u]
      )
    );
    socket.on("user-offline", (id) =>
      setOnlineUsers((prev) => prev.filter((u) => u._id !== id))
    );

    return () => {
      socket.off("online-users");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, []);

  // Load stats + charts
  useEffect(() => {
    (async () => {
      try {
        const s = await API.get("/api/admin/stats");
        setStats(s.data?.data || stats);

        const c = await API.get("/api/admin/chart-scores");
        setChartData(c.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Active text formatter
  const getLastActiveText = (u) => {
    if (onlineUsers.some((o) => o._id === u._id)) return "Online";
    if (!u.lastActive) return "Không rõ";

    const diffMs = Date.now() - new Date(u.lastActive).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    return `${diffHour} giờ trước`;
  };

  // Merge online + last active
  const mergedUsers = allUsers
    .map((u) => ({
      ...u,
      isOnline: onlineUsers.some((o) => o._id === u._id),
      lastActiveText: getLastActiveText(u),
    }))
    .sort((a, b) => (a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1));

  // 🔥 FILTER by search from Navbar
  const filteredUsers = mergedUsers.filter((u) =>
    u.name.toLowerCase().includes((userSearch || "").toLowerCase())
  );

  // Click user → load review
  const handleSelectUser = async (u) => {
    setActiveUser(u);
    setShowReview(false);

    try {
      const res = await API.get(`/api/users/${u._id}/quick-profile`);
      setActiveUser((prev) => ({ ...prev, ...res.data.data }));
    } catch (err) {
      console.error("Lỗi tải quick profile");
    }

    setTimeout(() => setShowReview(true), 20);
  };

  return (
    <>
      <Leftbar />

      <div className="adminhome-wrapper">
        <Navbar />

        <RightPanel activeUser={activeUser} trigger={rightPanelTrigger} />

        <div className="adminhome-content">
          {/* LEFT AREA */}
          <div className="adminhome-left">
            <h1 className="title">Dashboard tổng quan</h1>

            {/* Stats */}
            <div className="stats-box">
              {[
                { icon: <Users size={26} />, label: "Người dùng", value: stats.totalUsers },
                { icon: <FileCheck size={26} />, label: "Bài thi", value: stats.totalExams },
                { icon: <Target size={26} />, label: "Điểm TB", value: stats.avgScore },
                { icon: <Award size={26} />, label: "Tỉ lệ đạt", value: stats.passRate + "%" },
              ].map((s, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-icon">{s.icon}</div>
                  <div>
                    <p>{s.label}</p>
                    <h3>{s.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="chart-grid">
              <div className="chart-row-top">
                <div className="chart-card pie-card">
                  <h2>Tỉ lệ đạt</h2>
                  <ScorePieChart passRate={stats.passRate} />
                </div>

                <div className="chart-card">
                  <h2>Phân bố điểm</h2>
                  <PassRateBarChart data={chartData} />
                </div>
              </div>

              <div className="chart-card full">
                <h2>Xu hướng điểm</h2>
                <TrendLineChart data={chartData} />
              </div>
            </div>
          </div>

          {/* RIGHT AREA — USERS */}
          <div className="adminhome-right">
            <h2 className="right-title">Đang hoạt động</h2>

            <div className="online-list scrollable">
              {filteredUsers.map((u) => (
                <div
                  key={u._id}
                  className="online-item"
                  onClick={() => handleSelectUser(u)}
                >
                  <div className="online-avatar-wrapper">
                    <img src={getAvatar(u)} className="online-avatar" />
                    <span className={u.isOnline ? "online-dot" : "offline-dot"}></span>
                  </div>

                  <div>
                    <p className="online-name">{u.name}</p>
                    <span className="online-status">{u.lastActiveText}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* REVIEW PANEL */}
            {showReview && activeUser && (
              <div
                className="review-overlay-inside"
                onClick={() => setShowReview(false)}
              >
                <div
                  className="review-panel fadeSlide"
                  ref={reviewRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="review-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReview(false);
                    }}
                  >
                    ✕
                  </button>

                  <img src={getAvatar(activeUser)} className="review-avatar" />

                  <h3>{activeUser.name}</h3>
                  <p className="review-email">{activeUser.email}</p>

                  {activeUser.bio && <p className="review-bio">{activeUser.bio}</p>}

                  <div className="review-stats">
                    <div>
                      <p className="stat-label">Bài thi đã làm</p>
                      <h4>{activeUser.examCount ?? 0}</h4>
                    </div>

                    <div>
                      <p className="stat-label">Điểm cao nhất</p>
                      <h4>{activeUser.highestScore ?? "-"}</h4>
                    </div>
                  </div>

                  <button
                    className="review-btn"
                    onClick={() => navigate(`/profile/${activeUser._id}`)}
                  >
                    Xem hồ sơ
                  </button>

                  <button
                    className="review-btn second"
                    onClick={() => setRightPanelTrigger(Date.now())}
                  >
                    Gửi thông báo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

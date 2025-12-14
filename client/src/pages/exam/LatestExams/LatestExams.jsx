// src/pages/exam/LatestExams.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api/http";

import Leftbar from "../../../components/layout/leftbar/Leftbar.jsx";
import Navbar from "../../../components/layout/topbar/Navbar.jsx";

import { Layers, BadgeCheck, Play, Clock3, Puzzle } from "lucide-react";
import { useSidebar } from "../../../context/SidebarContext";
import { useNavigate } from "react-router-dom";

import "./LatestExams.css";

function LatestExams() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await API.get("/api/exam-sessions/practice/all");
      setSessions(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Leftbar />
      <Navbar />

      {/* MAIN CONTENT */}
      <div
        className={`lex-page transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <div className="lex-inner">
          {/* HERO */}
          <div className="lex-hero">
            <div className="lex-hero-top">
              <div className="lex-hero-icon">
                <Layers size={20} />
              </div>

              <div className="lex-hero-text">
                <h1 className="lex-title">Bài luyện tập mới nhất</h1>
                <p className="lex-subtitle">
                  Chọn một session để bắt đầu làm bài (Practice Mode)
                </p>
              </div>

              <div className="lex-pill">
                <BadgeCheck size={16} />
                Practice Library
              </div>
            </div>

            <div className="lex-hero-divider" />

            <div className="lex-hero-stats">
              <div className="lex-stat">
                <span className="lex-stat-k">Tổng session</span>
                <span className="lex-stat-v">{sessions.length}</span>
              </div>
              <div className="lex-stat">
                <span className="lex-stat-k">Trạng thái</span>
                <span className={`lex-stat-v ${loading ? "is-wait" : "is-ok"}`}>
                  {loading ? "Đang tải..." : "Sẵn sàng"}
                </span>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="lex-loading">
              <div className="lex-skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="lex-skeleton-card">
                    <div className="lex-skel-line w-40" />
                    <div className="lex-skel-line w-56" />
                    <div className="lex-skel-line w-48" />
                    <div className="lex-skel-row">
                      <div className="lex-skel-chip w-28" />
                      <div className="lex-skel-chip w-28" />
                    </div>
                    <div className="lex-skel-btn" />
                  </div>
                ))}
              </div>

              <div className="lex-loading-text">
                Đang tải danh sách bài luyện tập...
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading && sessions.length === 0 && (
            <div className="lex-empty">
              <div className="lex-empty-badge">Không có dữ liệu</div>
              <p className="lex-empty-text">Không tìm thấy bài luyện tập nào.</p>
            </div>
          )}

          {/* LIST ITEMS */}
          {!loading && sessions.length > 0 && (
            <div className="lex-grid">
              {sessions.map((s) => (
                <div key={s._id} className="lex-card">
                  <div className="lex-card-glow" />

                  <div className="lex-card-head">
                    <div className="lex-badge">
                      <BadgeCheck size={16} />
                      Practice Mode
                    </div>
                  </div>

                  <h3 className="lex-card-title" title={s.title}>
                    {s.title}
                  </h3>

                  {s.description ? (
                    <p className="lex-card-desc">{s.description}</p>
                  ) : (
                    <p className="lex-card-desc is-muted">
                      Không có mô tả cho session này.
                    </p>
                  )}

                  <div className="lex-meta">
                    <div className="lex-meta-item">
                      <Puzzle size={16} />
                      <span className="lex-meta-k">Số Part</span>
                      <span className="lex-meta-v">{s.parts?.length || 0}</span>
                    </div>

                    <div className="lex-meta-item">
                      <Clock3 size={16} />
                      <span className="lex-meta-k">Thời lượng</span>
                      <span className="lex-meta-v">
                        {s.totalDuration || 0} phút
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/exam-session/${s._id}`)}
                    className="lex-action"
                  >
                    <Play size={18} />
                    Bắt đầu luyện tập
                    <span className="lex-action-shine" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* FOOTER */}
          <footer className="lex-footer">
            © 2025 EduChain — Danh sách bài luyện tập
          </footer>
        </div>
      </div>
    </>
  );
}

export default LatestExams;

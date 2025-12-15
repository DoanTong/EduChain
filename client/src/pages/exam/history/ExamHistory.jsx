import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Leftbar from "../../../components/layout/leftbar/Leftbar";
import Navbar from "../../../components/layout/topbar/Navbar";
import API from "../../../api/http";
import "./ExamHistory.css";

import { Play, CheckCircle, XCircle, Clock, History } from "lucide-react";
import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext";

export default function ExamHistory() {
  const navigate = useNavigate();

  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapRef = useRef(null);

  // ✅ giữ hiệu ứng drag cũ nhưng ổn định hơn
  const dragRef = useRef({ dragging: false, startX: 0 });

  const clamp = (v) => Math.max(0, Math.min(sessions.length - 1, v));
  const goTo = (i) => setActiveIndex(clamp(i));

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  // ✅ điều hướng sang ReviewHistory.jsx (đổi route nếu bạn đặt khác)
  const goReview = (sessionId) => {
    // ví dụ: /review-history/:sessionId
    navigate(`/review-history/${sessionId}`);
  };

  // Wheel scroll
  const wheel = (e) => {
    // chặn cuộn trang khi đang lướt trong carousel
    e.preventDefault();
    e.stopPropagation();

    if (e.deltaY > 0) next();
    else prev();
  };

  // Drag
  const down = (e) => {
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
  };

  const move = (e) => {
    if (!dragRef.current.dragging) return;
    const diff = e.clientX - dragRef.current.startX;

    if (diff > 80) {
      prev();
      dragRef.current.dragging = false;
    }
    if (diff < -80) {
      next();
      dragRef.current.dragging = false;
    }
  };

  const up = () => {
    dragRef.current.dragging = false;
  };

  useEffect(() => {
    const w = wrapRef.current;
    if (!w) return;

    w.addEventListener("wheel", wheel, { passive: false });
    w.addEventListener("mousedown", down);
    w.addEventListener("mousemove", move);
    w.addEventListener("mouseup", up);
    w.addEventListener("mouseleave", up);

    return () => {
      w.removeEventListener("wheel", wheel);
      w.removeEventListener("mousedown", down);
      w.removeEventListener("mousemove", move);
      w.removeEventListener("mouseup", up);
      w.removeEventListener("mouseleave", up);
    };
  }, [sessions, activeIndex]); // giữ nguyên dependencies như code bạn

  // Load DB
  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  const load = async () => {
    const res = await API.get("/api/session-results/my");
    const list = res.data?.data || [];

    const cleaned = list
      .filter((i) => i.session)
      .map((i) => {
        const s = i.session;
        const d = i.durationSeconds || 0;
        const m = Math.floor(d / 60);
        const sec = d % 60;

        return {
          id: s._id,
          title: s.title,
          correct: i.totalCorrect,
          total: i.totalQuestions,
          acc: i.accuracy,
          time: d ? `${m} phút ${sec}s` : "Chưa ghi nhận",
        };
      });

    setSessions(cleaned);
    setActiveIndex(0);
  };

  return (
    <>
      <Leftbar />
      <Navbar />

      <div className={`exh-page ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>
        <div className="exh-inner">
          {/* HERO */}
          <div className="exh-hero">
            <div className="exh-hero-left">
              <div className="exh-hero-icon">
                <History size={18} />
              </div>
              <div className="exh-hero-text">
                <h1 className="exh-title">Kỳ thi bạn đã hoàn thành</h1>
                <p className="exh-sub">
                  Lăn chuột để chuyển card • Kéo ngang để lướt • Click để chọn
                </p>
              </div>
            </div>

            <div className="exh-hero-right">
              <div className="exh-pill">
                <span className="exh-pill-k">Tổng</span>
                <span className="exh-pill-v">{sessions.length}</span>
              </div>

              <div className="exh-pill is-active">
                <span className="exh-pill-k">Đang chọn</span>
                <span className="exh-pill-v">
                  {sessions.length ? activeIndex + 1 : 0}/{sessions.length}
                </span>
              </div>
            </div>

            <div className="exh-hero-glow" />
          </div>

          {/* EMPTY */}
          {sessions.length === 0 && (
            <div className="exh-empty">
              <div className="exh-empty-badge">Chưa có lịch sử</div>
              <p className="exh-empty-text">
                Bạn chưa hoàn thành bài nào để hiển thị ở đây.
              </p>
            </div>
          )}

          {/* CAROUSEL */}
          {sessions.length > 0 && (
            <>
              <div className="exh-banner exh-banner-top" />

              <div className="exh-wrap" ref={wrapRef}>
                <div className="exh-center">
                  {sessions.map((s, i) => {
                    const off = i - activeIndex;
                    const abs = Math.abs(off);

                    const wrong = Math.max(0, (s.total || 0) - (s.correct || 0));
                    const accVal = Number(s.acc || 0);
                    const accText = Number.isFinite(accVal)
                      ? `${accVal.toFixed(1)}%`
                      : "0.0%";

                    return (
                      <div
                        className="exh-item"
                        key={s.id}
                        style={{
                          "--o": off,
                          "--abs": abs,
                        }}
                        onClick={() => goTo(i)}
                      >
                        <div className="exh-card">
                          <div className="exh-card-top">
                            <div className="exh-card-titlewrap">
                              <h3 className="exh-card-title" title={s.title}>
                                {s.title}
                              </h3>
                              <span className="exh-sid">ID: {s.id}</span>
                            </div>

                            <div className="exh-chip">
                              <span className="exh-chip-dot" />
                              Completed
                            </div>
                          </div>

                          <div className="exh-stats">
                            <p className="exh-stat">
                              <CheckCircle className="exh-good" />
                              Đúng: <b>{s.correct}</b>
                            </p>

                            <p className="exh-stat">
                              <XCircle className="exh-bad" />
                              Sai: <b>{wrong}</b>
                            </p>

                            <p className="exh-stat">
                              🎯 Chính xác: <b className="exh-acc">{accText}</b>
                            </p>

                            <p className="exh-stat">
                              📝 Tổng câu: <b>{s.total}</b>
                            </p>

                            <p className="exh-stat">
                              <Clock size={16} className="exh-clock" />
                              <span>{s.time}</span>
                            </p>
                          </div>

                          {/* ✅ CHỈ SỬA NÚT NÀY: đi tới ReviewHistory.jsx */}
                          <button
                            type="button"
                            className="exh-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); // không làm ảnh hưởng click chọn card
                              goReview(s.id);
                            }}
                          >
                            <Play size={18} />
                            Xem lại kỳ thi
                            <span className="exh-btn-shine" />
                          </button>

                          <div className="exh-card-glow" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="exh-banner exh-banner-bottom" />
            </>
          )}

          <footer className="exh-footer">© 2025 EduChain — Exam History</footer>
        </div>
      </div>
    </>
  );
}

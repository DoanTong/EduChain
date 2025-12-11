import React, { useEffect, useState, useRef } from "react";
import Leftbar from "../../../components/layout/leftbar/Leftbar";
import Navbar from "../../../components/layout/topbar/Navbar";
import API from "../../../api/http";
import "./ExamHistory.css";

import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { useSidebar } from "../../../context/SidebarContext";
import { useAuth } from "../../../context/AuthContext";

export default function ExamHistory() {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapRef = useRef(null);

  const clamp = (v) => Math.max(0, Math.min(sessions.length - 1, v));

  const goTo = (i) => setActiveIndex(clamp(i));

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  // Wheel scroll
  const wheel = (e) => {
    if (e.deltaY > 0) next();
    else prev();
  };

  // Drag
  let dragging = false, startX = 0;

  const down = (e) => {
    dragging = true;
    startX = e.clientX;
  };

  const move = (e) => {
    if (!dragging) return;
    const diff = e.clientX - startX;
    if (diff > 80) { prev(); dragging = false; }
    if (diff < -80) { next(); dragging = false; }
  };

  const up = () => (dragging = false);

  useEffect(() => {
    const w = wrapRef.current;
    if (!w) return;
    w.addEventListener("wheel", wheel, { passive: true });
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
  }, [sessions, activeIndex]);

  // Load DB
  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  const load = async () => {
    const res = await API.get("/api/session-results/my");
    const list = res.data?.data || [];

    const cleaned = list
      .filter(i => i.session)
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
  };

  return (
    <>
      <Leftbar/>
      <Navbar/>

      <div className={`his-page ${collapsed ? "ml-[80px]" : "ml-[250px]"}`}>

        {/* Top banner */}
        <div className="his-banner top"></div>

        <h1 className="his-title">Kỳ thi bạn đã hoàn thành</h1>

        <div className="his-wrap" ref={wrapRef}>
          <div className="his-center">
            {sessions.map((s, i) => {
              const off = i - activeIndex;
              const abs = Math.abs(off);

              return (
                <div className="his-item"
                  key={s.id}
                  style={{
                    "--o": off,
                    "--abs": abs,
                  }}
                  onClick={() => goTo(i)}
                >
                  <div className="card">
                    <h3 className="card-title">{s.title}</h3>
                    <span className="sid">ID: {s.id}</span>

                    <div className="stats">
                      <p><CheckCircle className="good"/> Đúng: {s.correct}</p>
                      <p><XCircle className="bad"/> Sai: {s.total - s.correct}</p>
                      <p>🎯 {s.acc}% chính xác</p>
                      <p>📝 Tổng: {s.total}</p>
                      <p><Clock size={16}/> {s.time}</p>
                    </div>

                    <a className="card-btn" href={`/exam-session/${s.id}`}>
                      <Play size={18}/> Xem lại kỳ thi
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom banner */}
        <div className="his-banner bottom"></div>

      </div>
    </>
  );
}

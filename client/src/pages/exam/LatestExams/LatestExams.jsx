// src/pages/exam/LatestExams.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api/http";

import Leftbar from "../../../components/layout/leftbar/Leftbar.jsx";
import Navbar from "../../../components/layout/topbar/Navbar.jsx";

import { Layers, BadgeCheck, Play } from "lucide-react";
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
        className={`page-content transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <div className="pt-[88px] px-6 max-w-6xl mx-auto">

          {/* ---------------- PAGE TITLE ---------------- */}
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-6">
            <Layers className="text-blue-600" /> Bài luyện tập mới nhất
          </h1>

          {/* ---------------- LOADING ---------------- */}
          {loading && (
            <div className="text-center text-slate-500 py-16 text-lg">
              Đang tải danh sách bài luyện tập...
            </div>
          )}

          {/* ---------------- EMPTY ---------------- */}
          {!loading && sessions.length === 0 && (
            <div className="text-center text-slate-500 py-16 text-lg">
              Không tìm thấy bài luyện tập nào.
            </div>
          )}

          {/* ---------------- LIST ITEMS ---------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((s) => (
              <div
                key={s._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition border border-slate-100 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* TAG */}
                  <div className="flex items-center gap-2 mb-3">
                    <BadgeCheck className="text-blue-600" size={18} />
                    <span className="text-sm text-blue-600 font-medium">
                      Practice Mode
                    </span>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold text-slate-800 mb-1 line-clamp-1">
                    {s.title}
                  </h3>

                  {s.description && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  <p className="text-slate-600 text-sm">
                    Số Part:{" "}
                    <span className="font-medium text-purple-600">
                      {s.parts.length}
                    </span>
                  </p>

                  <p className="text-slate-600 text-sm">
                    Thời lượng:{" "}
                    <span className="font-medium text-green-600">
                      {s.totalDuration || 0} phút
                    </span>
                  </p>
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => navigate(`/exam-session/${s._id}`)}
                  className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition"
                >
                  <Play size={18} />
                  Bắt đầu luyện tập
                </button>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <footer className="text-center text-slate-400 text-sm py-8 mt-16">
            © 2025 EduChain — Danh sách bài luyện tập
          </footer>
        </div>
      </div>
    </>
  );
}

export default LatestExams;

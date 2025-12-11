import React, { useEffect, useState, useRef } from "react";
import API from "../../../../api/http";
import {
  Search,
  Award,
  PlusCircle,
  BookOpen,
  User as UserIcon,
} from "lucide-react";

import "./ResultTab.css";

export default function ResultTab() {
  const [list, setList] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState("all");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState({});

  const [sessions, setSessions] = useState([]);

  const gridRef = useRef(null);

  // =====================================================
  // LOAD
  // =====================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/session-results/published/eligible");
      const data = (res.data?.data || []).filter(
        (r) => r.user && r.session
      );

      setList(data);
      setFiltered(data);

      const u = [];
      const seen = new Set();
      data.forEach((r) => {
        if (!seen.has(r.session._id)) {
          seen.add(r.session._id);
          u.push({ _id: r.session._id, title: r.session.title });
        }
      });
      setSessions(u);
    } catch (err) {
      console.error("Load eligible results error:", err);
    }
    setLoading(false);
  };

  // =====================================================
  // FILTER
  // =====================================================
  useEffect(() => {
    const s = search.toLowerCase();

    const next = list.filter((r) => {
      const matchSearch =
        r.user?.name?.toLowerCase().includes(s) ||
        r.user?.email?.toLowerCase().includes(s) ||
        r.session?.title?.toLowerCase().includes(s);

      const matchSession =
        selectedSession === "all" || r.session?._id === selectedSession;

      return matchSearch && matchSession;
    });

    setFiltered(next);
  }, [search, selectedSession, list]);

  // =====================================================
  // CREATE CERTIFICATE
  // =====================================================
  const createCertificate = async (row) => {
    if (!row.user?.wallet) return alert("User chưa liên kết ví.");

    setCreating((p) => ({ ...p, [row._id]: true }));

    try {
      await API.post("/api/certificates", {
        sessionResultId: row._id,
      });
      alert("🎉 Đã tạo chứng chỉ thành công!");
    } catch (err) {
      console.error("Create certificate error:", err);
      alert("❌ Không thể tạo chứng chỉ.");
    }

    setCreating((p) => ({ ...p, [row._id]: false }));
  };

  // =====================================================
  // 3D TILT EFFECT
  // =====================================================
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".result-card");

    // tilt on mousemove
    cards.forEach((card) => {
      const inner = card;

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (+1 * y) / 25;
        const rotateY = (-1 * x) / 25;

        inner.style.transform = `
          translateY(-4px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.03)
        `;
      };

      const reset = () => {
        inner.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)";
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", reset);

      // scroll reactive
      window.addEventListener("scroll", reset);
    });
  }, [filtered]);

  // =====================================================
  // VIEW
  // =====================================================
  return (
    <div className="result-page">

      {/* HEADER */}
      <div className="result-header">
        <div>
          <div className="result-header-title">
            <Award size={26} />
            <h2>Tạo chứng chỉ từ kết quả đã publish</h2>
          </div>
          <p className="result-header-sub">
            Chọn học viên đạt yêu cầu (≥ 50%) để tạo bản ghi chứng chỉ.
          </p>
        </div>

        <div className="result-header-stat">
          <span className="stat-label">Tổng học viên đủ điều kiện</span>
          <span className="stat-value">{list.length}</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="result-toolbar">
        <div className="result-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc bài thi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="result-select"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="all">Tất cả bài thi</option>
          {sessions.map((s) => (
            <option key={s._id} value={s._id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-box">
          Không tìm thấy học viên phù hợp với điều kiện lọc.
        </div>
      ) : (
        <div className="result-grid" ref={gridRef}>
          {filtered.map((r) => {
            const wallet = r.user?.wallet || null;

            return (
              <div key={r._id} className="result-card">

                <div className="card-header">
                  <div className="card-avatar">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="card-name">{r.user?.name}</h3>
                    <p className="card-email">{r.user?.email}</p>
                  </div>
                </div>

                <div className="card-exam">
                  <span className="exam-label">
                    <BookOpen size={14} />
                    {r.session?.title}
                  </span>

                  <div className="score-box">
                    <span className="score-label">Accuracy</span>
                    <span className="score-value">
                      {r.accuracy}%
                    </span>
                  </div>
                </div>

                <div className="card-wallet">
                  <span className="wallet-label">Ví nhận chứng chỉ:</span>

                  {wallet ? (
                    <span className="wallet-value">{wallet}</span>
                  ) : (
                    <span className="wallet-missing">
                      Chưa liên kết ví – không thể tạo chứng chỉ
                    </span>
                  )}
                </div>

                <button
                  className="btn-create-card"
                  disabled={!wallet || creating[r._id]}
                  onClick={() => createCertificate(r)}
                >
                  {creating[r._id] ? (
                    "Đang tạo..."
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      Tạo chứng chỉ
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

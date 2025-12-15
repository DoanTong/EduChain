import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../../../api/http";
import { useAuth } from "../../../../context/AuthContext";
import "./ResultReview.css";

export default function ResultReview() {
  const { sessionId, examId } = useParams(); // ✅ đúng theo route
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id;

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [filter, setFilter] = useState("all"); // all | correct | wrong | blank
  const [searchNo, setSearchNo] = useState("");
  const leftRef = useRef(null);

  const LOG = (...args) =>
    console.log("%c[ResultPart]", "color:#2563eb;font-weight:800", ...args);
  const WARN = (...args) =>
    console.warn("%c[ResultPart]", "color:#f59e0b;font-weight:800", ...args);
  const ERR = (...args) =>
    console.error("%c[ResultPart]", "color:#ef4444;font-weight:800", ...args);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        LOG("Route params:", { sessionId, examId, userId });

        // 0) nếu được truyền qua state thì dùng luôn (nhanh nhất)
        const stateAttempt = location.state?.attempt || null;
        if (stateAttempt) {
          LOG("Use location.state.attempt ✅");
          setAttempt(stateAttempt);
          return;
        }

        // 1) ưu tiên localStorage session_result (đúng format bạn lưu ở DoExam)
        if (userId && sessionId && examId) {
          const all = JSON.parse(localStorage.getItem("session_result") || "{}");
          const local = all?.[userId]?.[sessionId]?.[examId];

          if (local) {
            LOG("Found localStorage session_result ✅", local);
            setAttempt({
              ...local,
              sessionId,
              examId,
              createdAt: local.createdAt || null,
            });
            return;
          }

          WARN("Không có localStorage session_result cho key:", {
            userId,
            sessionId,
            examId,
          });
        }

        // 2) fallback API: lấy review của cả session rồi pick đúng examId
        if (sessionId) {
          LOG("Fallback API GET:", `/api/session-results/${sessionId}/review`);
          const res = await API.get(`/api/session-results/${sessionId}/review`);
          const data = res.data?.data;

          const part = data?.results?.[examId];
          if (!part) {
            WARN("API có data nhưng không có results[examId].", {
              keys: Object.keys(data?.results || {}),
              examId,
            });
            setAttempt(null);
            return;
          }

          setAttempt({
            ...part,
            sessionId,
            examId,
            // normalize field names bạn đang dùng ở UI bên dưới
            totalQuestions: part.total ?? part.totalQuestions,
            totalCorrect: part.correct ?? part.totalCorrect,
            durationSeconds: data?.durationSeconds ?? part.durationSeconds,
            createdAt: data?.createdAt ?? part.createdAt,
          });

          LOG("Use API part result ✅");
          return;
        }

        setAttempt(null);
      } catch (e) {
        ERR("Load result failed:", e?.message || e);
        setAttempt(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, examId, userId]);

  // -------------------------------
  // Normalize questions & answers
  // -------------------------------
  const questions = useMemo(() => attempt?.questions || [], [attempt]);

  const pickedIndexByQuestionIndex = useMemo(() => {
    // attempt.answers bạn đang lưu dạng object index-map (answers[i]) hoặc array
    const a = attempt?.answers;

    // case 1: object index-map (ví dụ answers[0]=2)
    if (a && typeof a === "object" && !Array.isArray(a)) return a;

    // case 2: array answers theo thứ tự
    if (Array.isArray(a)) {
      const m = {};
      a.forEach((val, idx) => (m[idx] = val));
      return m;
    }

    return {};
  }, [attempt]);

  // -------------------------------
  // Stats
  // -------------------------------
  const stats = useMemo(() => {
    let correct = 0,
      wrong = 0,
      blank = 0;

    questions.forEach((q, i) => {
      const picked = pickedIndexByQuestionIndex[i];
      if (picked === undefined || picked === -1) return blank++;
      if (picked === q.answer) correct++;
      else wrong++;
    });

    const total = questions.length;

    // ưu tiên số liệu BE/local đã tính sẵn nếu có
    const beTotal = attempt?.totalQuestions ?? attempt?.total ?? null;
    const beCorrect = attempt?.totalCorrect ?? attempt?.correct ?? null;

    const finalTotal = beTotal ?? total;
    const finalCorrect = beCorrect ?? correct;
    const finalWrong =
      beTotal != null && beCorrect != null ? beTotal - beCorrect : wrong;

    return {
      total: finalTotal,
      correct: finalCorrect,
      wrong: finalWrong,
      blank,
      accuracy: finalTotal
        ? Math.round((finalCorrect / Math.max(1, finalTotal)) * 100)
        : 0,
    };
  }, [questions, pickedIndexByQuestionIndex, attempt]);

  const durationText = useMemo(() => {
    const s = attempt?.durationSeconds;
    if (s === undefined || s === null) return "—";
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [attempt]);

  // -------------------------------
  // Filtered question indexes
  // -------------------------------
  const visibleIndexes = useMemo(() => {
    const arr = [];
    questions.forEach((q, i) => {
      const picked = pickedIndexByQuestionIndex[i];
      const isBlank = picked === undefined || picked === -1;
      const isCorrect = !isBlank && picked === q.answer;
      const isWrong = !isBlank && picked !== q.answer;

      if (filter === "all") arr.push(i);
      else if (filter === "correct" && isCorrect) arr.push(i);
      else if (filter === "wrong" && isWrong) arr.push(i);
      else if (filter === "blank" && isBlank) arr.push(i);
    });
    return arr;
  }, [questions, pickedIndexByQuestionIndex, filter]);

  const scrollToQuestion = (index) => {
    const el = document.getElementById(`rr-q-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpBySearch = () => {
    const n = Number(searchNo);
    if (!Number.isFinite(n) || n <= 0) return;
    const idx = n - 1;
    if (idx >= 0 && idx < questions.length) scrollToQuestion(idx);
  };

  const answerClass = (picked, correct, idx) => {
    const base = "rr-opt";
    if (idx === correct) return `${base} isCorrect`;
    if (picked === idx && picked !== correct) return `${base} isWrong`;
    if (picked === idx && picked === correct) return `${base} isPickedRight`;
    return base;
  };

  const renderPart1 = (q, qIndex) => {
    const picked = pickedIndexByQuestionIndex[qIndex];
    return (
      <div className="rr-p1">
        {q.imageUrl && <img src={q.imageUrl} className="rr-p1-img" alt="" />}
        <div className="rr-p1-list">
          {["A", "B", "C", "D"].map((letter, idx) => (
            <div key={idx} className={answerClass(picked, q.answer, idx)}>
              <div className="rr-optLeft">
                <span className="rr-letter">{letter}</span>
                <span className="rr-optMeta">
                  {picked === idx ? "Bạn chọn" : ""}
                  {q.answer === idx ? (picked === idx ? " • Đúng" : "Đáp án") : ""}
                </span>
              </div>

              {q.audioUrls?.[idx] ? (
                <audio controls className="rr-audio">
                  <source src={q.audioUrls[idx]} />
                </audio>
              ) : (
                <div className="rr-audioPlaceholder">Không có audio</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDefault = (q, qIndex) => {
    const picked = pickedIndexByQuestionIndex[qIndex];
    return (
      <>
        {q.audioUrls?.[0] && (
          <audio controls className="rr-audio-big">
            <source src={q.audioUrls[0]} />
          </audio>
        )}

        <div className="rr-options">
          {["A", "B", "C", "D"].map((letter, idx) => (
            <div key={idx} className={answerClass(picked, q.answer, idx)}>
              <div className="rr-optLeft">
                <span className="rr-letter">{letter}</span>
                <span className="rr-optMeta">
                  {picked === idx ? "Bạn chọn" : ""}
                  {q.answer === idx ? (picked === idx ? " • Đúng" : "Đáp án") : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  if (loading) return <div className="rr-loading">Đang tải kết quả...</div>;
  if (!attempt) return <div className="rr-loading">Không tìm thấy dữ liệu kết quả.</div>;

  return (
    <div className="rr-page">
      <div className="rr-left" ref={leftRef}>
        <div className="rr-header">
          <div className="rr-titleWrap">
            <h1 className="rr-title">Kết quả Part</h1>
            <div className="rr-sub">
              <span className="rr-pill">Accuracy: {stats.accuracy}%</span>
              <span className="rr-pill">Thời gian: {durationText}</span>
            </div>
          </div>

          <button className="rr-back" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>

        {visibleIndexes.map((index) => {
          const q = questions[index];
          const picked = pickedIndexByQuestionIndex[index];
          const isBlank = picked === undefined || picked === -1;
          const isCorrect = !isBlank && picked === q.answer;

          return (
            <div key={index} id={`rr-q-${index}`} className="rr-card">
              <div className="rr-cardTop">
                <h2 className="rr-qtitle">Câu {index + 1}</h2>

                <div className="rr-badges">
                  <span
                    className={`rr-badge ${
                      isBlank ? "isBlank" : isCorrect ? "isCorrect" : "isWrong"
                    }`}
                  >
                    {isBlank ? "Bỏ trống" : isCorrect ? "Đúng" : "Sai"}
                  </span>
                  <span className="rr-badge isPart">
                    Part {q.partNumber || q.part || 1}
                  </span>
                </div>
              </div>

              {q.partNumber === 1 ? renderPart1(q, index) : renderDefault(q, index)}
            </div>
          );
        })}
      </div>

      <aside className="rr-right">
        <div className="rr-rightCard">
          <div className="rr-rightTop">
            <div className="rr-stat">
              <div className="rr-statLabel">Tổng câu</div>
              <div className="rr-statValue">{stats.total}</div>
            </div>
            <div className="rr-stat">
              <div className="rr-statLabel">Đúng</div>
              <div className="rr-statValue isGood">{stats.correct}</div>
            </div>
            <div className="rr-stat">
              <div className="rr-statLabel">Sai</div>
              <div className="rr-statValue isBad">{stats.wrong}</div>
            </div>
            <div className="rr-stat">
              <div className="rr-statLabel">Bỏ trống</div>
              <div className="rr-statValue isMute">{stats.blank}</div>
            </div>
          </div>

          <div className="rr-tools">
            <div className="rr-filterRow">
              <button className={`rr-chip ${filter === "all" ? "isActive" : ""}`} onClick={() => setFilter("all")}>Tất cả</button>
              <button className={`rr-chip ${filter === "correct" ? "isActive" : ""}`} onClick={() => setFilter("correct")}>Đúng</button>
              <button className={`rr-chip ${filter === "wrong" ? "isActive" : ""}`} onClick={() => setFilter("wrong")}>Sai</button>
              <button className={`rr-chip ${filter === "blank" ? "isActive" : ""}`} onClick={() => setFilter("blank")}>Bỏ trống</button>
            </div>

            <div className="rr-searchRow">
              <input className="rr-search" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Nhảy tới câu... (vd: 12)" />
              <button className="rr-searchBtn" onClick={jumpBySearch}>Đi</button>
            </div>
          </div>

          <div className="rr-section">
            <div className="rr-sectionTitle">Danh sách câu</div>
            <div className="rr-grid">
              {questions.map((q, i) => {
                const picked = pickedIndexByQuestionIndex[i];
                const isBlank = picked === undefined || picked === -1;
                const isCorrect = !isBlank && picked === q.answer;
                const cls = isBlank ? "isBlank" : isCorrect ? "isCorrect" : "isWrong";
                return (
                  <button key={i} type="button" className={`rr-gridItem ${cls}`} onClick={() => scrollToQuestion(i)}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rr-tip">Mẹo: lọc “Sai” rồi dùng lưới để nhảy nhanh.</div>
        </div>
      </aside>
    </div>
  );
}

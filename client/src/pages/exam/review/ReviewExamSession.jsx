import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../../api/http";

import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle
} from "lucide-react";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

import "./ReviewExamSession.css";

function ReviewExamSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [data, setData] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    if (!state) fetchReview();
  }, [state]);

  const fetchReview = async () => {
    try {
      const res = await API.get(`/api/session-results/${id}/review`);
      setData(res.data.data);
    } catch (err) {
      console.error("❌ Load review failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="review-loading">Đang tải dữ liệu...</div>;
  if (!data) return <div className="review-loading">Không có dữ liệu để xem.</div>;

  // ==========================
  // SAFE VALUES
  // ==========================
  const {
    results: rawResults = {},
    totalQuestions = 0,
    totalCorrect = 0,
    mode
  } = data;

  // FIX NaN (accuracy)
  const accuracy =
    totalQuestions > 0
      ? ((totalCorrect / totalQuestions) * 100).toFixed(1)
      : "0.0";

  // UI state
  const [openPart, setOpenPart] = React.useState(null);
  const togglePart = (examId) =>
    setOpenPart(openPart === examId ? null : examId);

  // ==========================
  // RADAR CHART FIX
  // ==========================
  const MAX_PARTS = 7;

  const realParts = Object.entries(rawResults).map(([key, r], idx) => {
    const total = r?.total ?? 0;
    const correct = r?.correct ?? 0;

    const score =
      total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0;

    return {
      part: `Part ${idx + 1}`,
      score
    };
  });

  while (realParts.length < MAX_PARTS) {
    realParts.push({ part: `Part ${realParts.length + 1}`, score: 0 });
  }

  const radarData = realParts.slice(0, MAX_PARTS);
  const hasRadarData = radarData.some((p) => p.score > 0);

  const resultEntries = Object.entries(rawResults);

  return (
    <div className="review-wrapper fade-in">

      {/* HEADER */}
      <div className="review-header-card">
        <h1 className="review-title">Kết quả kỳ thi</h1>
        <p className="review-sub">Mã kỳ thi: {id}</p>
      </div>

      {/* SUMMARY */}
      <div className="top-analytics-grid">
        <div className="summary-box">
          <h3 className="summary-title">Thống kê toàn bài</h3>

          <div className="summary-stats">
            <div className="summary-item">
              <span>Tổng câu:</span>
              <strong>{totalQuestions}</strong>
            </div>

            <div className="summary-item">
              <span>Đúng:</span>
              <strong className="text-green">{totalCorrect}</strong>
            </div>

            <div className="summary-item">
              <span>Sai:</span>
              <strong className="text-red">
                {totalQuestions - totalCorrect}
              </strong>
            </div>

            <div className="summary-item">
              <span>Độ chính xác:</span>
              <strong className="text-blue">{accuracy}%</strong>
            </div>
          </div>
        </div>

        {/* RADAR */}
        <div className="chart-box">
          <h3 className="chart-title">Điểm theo từng Part</h3>

          {hasRadarData ? (
            <ResponsiveContainer width="100%" height={330}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />

                <PolarAngleAxis
                  dataKey="part"
                  tick={{ fontSize: 13, fontWeight: 600 }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                />

                <Radar
                  name="Điểm Part"
                  dataKey="score"
                  stroke="#0891b2"
                  fill="#06b6d4"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-chart">Chưa có dữ liệu để vẽ biểu đồ.</p>
          )}
        </div>
      </div>

      {/* PRACTICE MODE */}
      {mode === "practice" && (
        <>
          <h2 className="review-section-title">Chi tiết từng Part</h2>

          <div className="review-part-list">
            {resultEntries.map(([examId, r], idx) => (
              <div key={examId} className="review-part-card slide-up">

                <div className="part-header" onClick={() => togglePart(examId)}>
                  <div>
                    <h3>Part {idx + 1}</h3>
                    <p>Đúng {r.correct} / {r.total}</p>
                  </div>

                  {openPart === examId
                    ? <ChevronUp size={22} />
                    : <ChevronDown size={22} />}
                </div>

                {openPart === examId && (
                  <div className="part-body fade-in">
                    {r.questions.map((q, i) => {
                      const userAns = r.answers[i];
                      const isCorrect = userAns === q.answer;

                      return (
                        <div key={i} className="question-row">
                          <div className="question-header">
                            {isCorrect
                              ? <CheckCircle size={20} color="#22c55e" />
                              : <XCircle size={20} color="#ef4444" />}

                            <span>
                              Câu {i + 1}:{" "}
                              {isCorrect
                                ? <strong className="text-green">Đúng</strong>
                                : <strong className="text-red">Sai</strong>}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div className="question-detail">
                              <p>
                                <strong>Đáp án đúng:</strong>{" "}
                                {String.fromCharCode(65 + q.answer)}
                              </p>
                              <p>
                                <strong>Bạn chọn:</strong>{" "}
                                {userAns !== undefined
                                  ? String.fromCharCode(65 + userAns)
                                  : "—"}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          
        </>
      )}
      <button className="btn-back-home" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
    </div>
  );
}

export default ReviewExamSession;

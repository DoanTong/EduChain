import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Layers } from "lucide-react";
import API from "../../../../api/http";
import "./ReviewHistory.css";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

function ReviewHistory() {
  const { id } = useParams(); // sessionId
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [results, setResults] = useState({});

  const { user } = useAuth();
  const userId = user?._id;

  // Timer để tính thời gian làm session (giữ nguyên - không phá logic cũ)
  const timeRef = useRef(Date.now());

  // ============================================================
  // LOAD SESSION + LOAD LOCAL RESULTS
  // ============================================================
  useEffect(() => {
    timeRef.current = Date.now();
    loadSession();
    loadLocalResults();
  }, [id, userId]);

  const loadSession = async () => {
    try {
      const res = await API.get(`/api/exam-sessions/${id}`);
      setSession(res.data?.data);
    } catch (err) {
      console.error("❌ Lỗi load session:", err);
    }
  };

  const loadLocalResults = () => {
    const all = JSON.parse(localStorage.getItem("session_result") || "{}");

    if (userId && all[userId] && all[userId][id]) {
      setResults(all[userId][id]);
    } else {
      setResults({});
    }
  };

  if (!session) return <div className="esp-loading">Đang tải...</div>;

  const totalDuration = session.parts.reduce(
    (sum, p) => sum + (p.durationMinutes || 0),
    0
  );

  // ============================================================
  // ✅ 1) CLICK PART -> ĐI XEM KẾT QUẢ PART (result part)
  // ============================================================
  const handleViewPartResult = (examId, index) => {
    const partInfo = session.parts[index];
    const label =
      partInfo?.label || partInfo?.exam?.title || `Part ${index + 1}`;

    // Nếu chưa làm part này thì không cho xem
    if (!results?.[examId]) {
      toast.info(`Part "${label}" chưa có kết quả để xem.`);
      return;
    }

    // Điều hướng sang trang xem kết quả part
    // Bạn tạo route /result-part/:sessionId/:examId
    navigate(`/result-part/${id}/${examId}`, {
      state: {
        sessionId: id,
        examId,
        partIndex: index,
        partLabel: label,
        // data kết quả part (đủ questions/answers/correct/total...)
        partResult: results[examId],
      },
    });
  };

  // ============================================================
  // ✅ 2) NÚT "XEM THỐNG KÊ" -> ĐI TỚI TRANG THỐNG KÊ
  // ============================================================
  const handleViewStats = () => {
    const resultValues = Object.values(results || {});
    if (!resultValues.length) {
      toast.warning("Chưa có dữ liệu để thống kê!");
      return;
    }

    const totalQuestions = resultValues.reduce((s, r) => s + (r?.total || 0), 0);
    const totalCorrect = resultValues.reduce((s, r) => s + (r?.correct || 0), 0);

    const accuracy =
      totalQuestions > 0
        ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1))
        : 0;

    // Điều hướng sang trang thống kê
    // Bạn tạo route /review-history/:id/stats
    navigate(`/review-history/${id}/stats`, {
      state: {
        sessionId: id,
        sessionTitle: session.title,
        results,
        totalQuestions,
        totalCorrect,
        accuracy,
        totalDuration,
        status: session.status,
      },
    });
  };

  // ============================================================
  // PART STATUS (giữ nguyên)
  // ============================================================
  const renderPartStatus = (examId) => {
    return results[examId] ? (
      <span className="esp-part-status esp-part-status--done">✔ Đã có kết quả</span>
    ) : (
      <span className="esp-part-status esp-part-status--none">⭕ Chưa có</span>
    );
  };

  // ============================================================
  // RENDER UI
  // ============================================================
  return (
    <div className="esp-page esp-fade-in">
      <div className="esp-page-inner">
        {/* HEADER */}
        <div className="esp-header-card esp-card-shadow">
          <div className="esp-header-top">
            <div>
              <p className="esp-breadcrumb">Kỳ thi tổng hợp • EduChain Session</p>
              <h1 className="esp-title">{session.title}</h1>
              <p className="esp-subtitle">{session.description}</p>
            </div>

            <div className="esp-status-pill">
              <span className="esp-status-label">Trạng thái</span>
              <span className={`esp-status-badge esp-status-${session.status}`}>
                {session.status === "practice" && "Luyện tập"}
                {session.status === "draft" && "Nháp"}
                {session.status === "published" && "Công bố"}
              </span>
            </div>
          </div>

          <div className="esp-header-stats">
            <div className="esp-stat-chip">
              <div className="esp-stat-icon">
                <Layers size={18} />
              </div>
              <div className="esp-stat-text">
                <span className="esp-stat-label">Số Part</span>
                <span className="esp-stat-value">{session.parts.length} phần</span>
              </div>
            </div>

            <div className="esp-stat-chip">
              <div className="esp-stat-icon">
                <Clock size={18} />
              </div>
              <div className="esp-stat-text">
                <span className="esp-stat-label">Thời lượng dự kiến</span>
                <span className="esp-stat-value">{totalDuration} phút</span>
              </div>
            </div>

            <div className="esp-stat-chip esp-stat-chip-soft">
              <div className="esp-stat-text">
                <span className="esp-stat-label">Gợi ý</span>
                <span className="esp-stat-value">
                  Click vào Part để xem lại kết quả Part đó
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PART LIST */}
        <div className="esp-section-header">
          <div>
            <h2 className="esp-section-title">Danh sách các Part</h2>
            <p className="esp-section-subtitle">
              Mỗi Part là một bài thi riêng, click để xem kết quả Part (nếu đã làm).
            </p>
          </div>
        </div>

        <div className="esp-part-grid">
          {session.parts.map((p, index) => {
            const examId = p.exam?._id || p.exam;

            return (
              <div key={index} className="esp-part-card esp-card-shadow esp-slide-up">
                <div className="esp-part-header">
                  <span className="esp-part-index-badge">PART {index + 1}</span>
                  <h3 className="esp-part-title">
                    {p.label || p.exam?.title || `Bài thi ${index + 1}`}
                  </h3>
                </div>

                <div className="esp-part-meta">
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Bài thi</span>
                    <span className="esp-meta-value">{p.exam?.title || "Không rõ"}</span>
                  </div>
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Thứ tự</span>
                    <span className="esp-meta-value">{p.order}</span>
                  </div>
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Thời lượng</span>
                    <span className="esp-meta-value">{p.durationMinutes} phút</span>
                  </div>
                </div>

                <div className="esp-part-footer">
                  <div className="esp-part-status-box">{renderPartStatus(examId)}</div>

                  {/* ✅ đổi nút: không làm lại, chỉ xem kết quả part */}
                  <button
                    className="esp-btn esp-btn-primary"
                    onClick={() => handleViewPartResult(examId, index)}
                  >
                    Xem kết quả Part
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ đổi "Nộp kỳ thi" -> "Xem thống kê" */}
        <div className="esp-submit-wrapper">
          <button className="esp-btn esp-btn-submit" onClick={handleViewStats}>
            Xem thống kê
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewHistory;

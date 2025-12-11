// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Clock, Layers } from "lucide-react";
// import API from "../../api/http";
// import "./ExamSessionPage.css";
// import { useAuth } from "../../context/AuthContext";
// import { toast } from "react-toastify";

// function ExamSessionPage() {
//   const { id } = useParams(); // sessionId
//   const navigate = useNavigate();

//   const [session, setSession] = useState(null);
//   const [results, setResults] = useState({});

//   const { user } = useAuth();
//   const userId = user?._id;

//   // Timer để tính thời gian làm session
//   const timeRef = useRef(Date.now());

//   // ============================================================
//   // LOAD SESSION + LOAD LOCAL RESULTS
//   // ============================================================
//   useEffect(() => {
//     timeRef.current = Date.now(); // reset timer khi vào lại trang
//     loadSession();
//     loadLocalResults();
//   }, [id, userId]);

//   const loadSession = async () => {
//     try {
//       const res = await API.get(`/api/exam-sessions/${id}`);
//       setSession(res.data?.data);
//     } catch (err) {
//       console.error("❌ Lỗi load session:", err);
//     }
//   };

//   const loadLocalResults = () => {
//     const all = JSON.parse(localStorage.getItem("session_result") || "{}");

//     if (all[userId] && all[userId][id]) {
//       setResults(all[userId][id]);
//     } else {
//       setResults({});
//     }
//   };

//   if (!session) return <div className="esp-loading">Đang tải...</div>;

//   const totalDuration = session.parts.reduce(
//     (sum, p) => sum + (p.durationMinutes || 0),
//     0
//   );

//   // ============================================================
//   // NỘP BÀI – LƯU KẾT QUẢ VÀO BACKEND
//   // ============================================================
//   const handleSubmitSession = async () => {
//     const resultValues = Object.values(results);

//     if (!resultValues.length) {
//       toast.warning("Bạn chưa làm part nào!");
//       return;
//     }

//     const totalQuestions = resultValues.reduce((s, r) => s + r.total, 0);
//     const totalCorrect = resultValues.reduce((s, r) => s + r.correct, 0);

//     const accuracy =
//       totalQuestions > 0
//         ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1))
//         : 0;

//     const durationSeconds = Math.floor(
//       (Date.now() - timeRef.current) / 1000
//     );

//     // 🔥 Build parts đúng chuẩn từ session + results
//     const partsPayload = session.parts.map((p, index) => {
//       const examId = p.exam?._id || p.exam;
//       const r = results[examId];

//       return {
//         examId,
//         label: p.label || `Part ${index + 1}`, // LABEL CHUẨN TỪ SESSION
//         correct: r?.correct || 0,
//         total: r?.total || 0,
//       };
//     });

//     try {
//       // LƯU LÊN SERVER
//       await API.post("/api/session-results", {
//         sessionId: id,
//         parts: partsPayload,
//         totalCorrect,
//         totalQuestions,
//         accuracy,
//         durationSeconds,
//       });

//       toast.success("Đã lưu kết quả kỳ thi!");
//     } catch (err) {
//       console.error("❌ Save session result failed:", err);
//       toast.error("Không lưu được kết quả lên server!");
//     }

//     // 🔄 Điều hướng sang trang review
//     if (session.status === "practice") {
//       navigate(`/exam-session/${id}/review`, {
//         state: {
//           results,
//           totalQuestions,
//           totalCorrect,
//           mode: "practice",
//         },
//       });
//     } else if (session.status === "published") {
//       navigate(`/exam-session/${id}/review`, {
//         state: {
//           totalQuestions,
//           totalCorrect,
//           mode: "official",
//         },
//       });
//     } else {
//       toast.warning("Kỳ thi NHÁP không thể nộp!");
//     }
//   };

//   // ============================================================
//   // PART STATUS
//   // ============================================================
//   const renderPartStatus = (examId) => {
//     return results[examId] ? (
//       <span className="esp-part-status esp-part-status--done">
//         ✔ Đã hoàn thành
//       </span>
//     ) : (
//       <span className="esp-part-status esp-part-status--none">
//         ⭕ Chưa làm
//       </span>
//     );
//   };

//   // ============================================================
//   // RENDER UI
//   // ============================================================
//   return (
//     <div className="esp-page esp-fade-in">
//       <div className="esp-page-inner">
//         {/* HEADER */}
//         <div className="esp-header-card esp-card-shadow">
//           <div className="esp-header-top">
//             <div>
//               <p className="esp-breadcrumb">
//                 Kỳ thi tổng hợp • EduChain Session
//               </p>
//               <h1 className="esp-title">{session.title}</h1>
//               <p className="esp-subtitle">{session.description}</p>
//             </div>
//             <div className="esp-status-pill">
//               <span className="esp-status-label">Trạng thái</span>
//               <span
//                 className={`esp-status-badge esp-status-${session.status}`}
//               >
//                 {session.status === "practice" && "Luyện tập"}
//                 {session.status === "draft" && "Nháp"}
//                 {session.status === "published" && "Công bố"}
//               </span>
//             </div>
//           </div>

//           <div className="esp-header-stats">
//             <div className="esp-stat-chip">
//               <div className="esp-stat-icon">
//                 <Layers size={18} />
//               </div>
//               <div className="esp-stat-text">
//                 <span className="esp-stat-label">Số Part</span>
//                 <span className="esp-stat-value">
//                   {session.parts.length} phần
//                 </span>
//               </div>
//             </div>

//             <div className="esp-stat-chip">
//               <div className="esp-stat-icon">
//                 <Clock size={18} />
//               </div>
//               <div className="esp-stat-text">
//                 <span className="esp-stat-label">Thời lượng dự kiến</span>
//                 <span className="esp-stat-value">{totalDuration} phút</span>
//               </div>
//             </div>

//             <div className="esp-stat-chip esp-stat-chip-soft">
//               <div className="esp-stat-text">
//                 <span className="esp-stat-label">Gợi ý</span>
//                 <span className="esp-stat-value">
//                   Hoàn thành tất cả part trước khi ấn "Nộp kỳ thi"
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* PART LIST */}
//         <div className="esp-section-header">
//           <div>
//             <h2 className="esp-section-title">Danh sách các Part</h2>
//             <p className="esp-section-subtitle">
//               Mỗi Part là một bài thi riêng, kết quả sẽ được gộp lại cho toàn
//               kỳ thi.
//             </p>
//           </div>
//         </div>

//         <div className="esp-part-grid">
//           {session.parts.map((p, index) => {
//             const examId = p.exam?._id || p.exam;

//             return (
//               <div
//                 key={index}
//                 className="esp-part-card esp-card-shadow esp-slide-up"
//               >
//                 <div className="esp-part-header">
//                   <span className="esp-part-index-badge">
//                     PART {index + 1}
//                   </span>
//                   <h3 className="esp-part-title">
//                     {p.label || p.exam?.title || `Bài thi ${index + 1}`}
//                   </h3>
//                 </div>

//                 <div className="esp-part-meta">
//                   <div className="esp-part-meta-row">
//                     <span className="esp-meta-label">Bài thi</span>
//                     <span className="esp-meta-value">
//                       {p.exam?.title || "Không rõ"}
//                     </span>
//                   </div>
//                   <div className="esp-part-meta-row">
//                     <span className="esp-meta-label">Thứ tự</span>
//                     <span className="esp-meta-value">{p.order}</span>
//                   </div>
//                   <div className="esp-part-meta-row">
//                     <span className="esp-meta-label">Thời lượng</span>
//                     <span className="esp-meta-value">
//                       {p.durationMinutes} phút
//                     </span>
//                   </div>
//                 </div>

//                 <div className="esp-part-footer">
//                   <div className="esp-part-status-box">
//                     {renderPartStatus(examId)}
//                   </div>

//                   <button
//                     className="esp-btn esp-btn-primary"
//                     onClick={() =>
//                       navigate(
//                         `/exam/${examId}?session=${session._id}&part=${index}`
//                       )
//                     }
//                     disabled={!!results[examId]}
//                   >
//                     {results[examId] ? "Đã hoàn thành" : "Làm Part này"}
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="esp-submit-wrapper">
//           <button
//             className="esp-btn esp-btn-submit"
//             onClick={handleSubmitSession}
//           >
//             Nộp kỳ thi
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ExamSessionPage;
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Layers } from "lucide-react";
import API from "../../api/http";
import "./ExamSessionPage.css";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function ExamSessionPage() {
  const { id } = useParams(); // sessionId
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [results, setResults] = useState({});

  const { user } = useAuth();
  const userId = user?._id;

  // Timer để tính thời gian làm session
  const timeRef = useRef(Date.now());

  // ============================================================
  // LOAD SESSION + LOAD LOCAL RESULTS
  // ============================================================
  useEffect(() => {
    timeRef.current = Date.now(); // reset timer khi vào lại trang
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

    if (all[userId] && all[userId][id]) {
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
  // NỘP BÀI – LƯU KẾT QUẢ VÀO BACKEND
  // ============================================================
  const handleSubmitSession = async () => {
    const resultValues = Object.values(results);

    if (!resultValues.length) {
      toast.warning("Bạn chưa làm part nào!");
      return;
    }

    const totalQuestions = resultValues.reduce((s, r) => s + r.total, 0);
    const totalCorrect = resultValues.reduce((s, r) => s + r.correct, 0);

    const accuracy =
      totalQuestions > 0
        ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1))
        : 0;

    const durationSeconds = Math.floor(
      (Date.now() - timeRef.current) / 1000
    );

    // 🔥 Build parts đúng chuẩn từ session + results
    const partsPayload = session.parts.map((p, index) => {
      const examId = p.exam?._id || p.exam;
      const r = results[examId];

      return {
        examId,
        label: p.label || `Part ${index + 1}`, // LABEL CHUẨN TỪ SESSION
        correct: r?.correct || 0,
        total: r?.total || 0,
      };
    });

    try {
      // LƯU LÊN SERVER
      await API.post("/api/session-results", {
        sessionId: id,
        parts: partsPayload,
        totalCorrect,
        totalQuestions,
        accuracy,
        durationSeconds,
      });

      toast.success("Đã lưu kết quả kỳ thi!");
    } catch (err) {
      console.error("❌ Save session result failed:", err);
      toast.error("Không lưu được kết quả lên server!");
    }

    // 🔄 Điều hướng sang trang review
    if (session.status === "practice") {
      navigate(`/exam-session/${id}/review`, {
        state: {
          results,
          totalQuestions,
          totalCorrect,
          mode: "practice",
        },
      });
    } else if (session.status === "published") {
      navigate(`/exam-session/${id}/review`, {
        state: {
          totalQuestions,
          totalCorrect,
          mode: "official",
        },
      });
    } else {
      toast.warning("Kỳ thi NHÁP không thể nộp!");
    }
  };

  // ============================================================
  // CONFIRM TRƯỚC KHI LÀM PART
  // ============================================================
  const handleStartPart = (examId, index) => {
    const partInfo = session.parts[index];
    const label = partInfo?.label || partInfo?.exam?.title || `Part ${index + 1}`;
    const isOfficial = session.status === "published";

    const message = isOfficial
      ? `Đây là KỲ THI CHÍNH THỨC.\nBạn có chắc chắn muốn bắt đầu "${label}" không?\nThời gian sẽ được tính từ lúc bạn vào bài.`
      : `Bạn có chắc chắn muốn bắt đầu làm "${label}" không?\nThời gian sẽ được tính từ lúc bạn vào bài.`;

    const ok = window.confirm(message);
    if (!ok) return;

    navigate(`/exam/${examId}?session=${session._id}&part=${index}`);
  };

  // ============================================================
  // PART STATUS
  // ============================================================
  const renderPartStatus = (examId) => {
    return results[examId] ? (
      <span className="esp-part-status esp-part-status--done">
        ✔ Đã hoàn thành
      </span>
    ) : (
      <span className="esp-part-status esp-part-status--none">
        ⭕ Chưa làm
      </span>
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
              <p className="esp-breadcrumb">
                Kỳ thi tổng hợp • EduChain Session
              </p>
              <h1 className="esp-title">{session.title}</h1>
              <p className="esp-subtitle">{session.description}</p>
            </div>
            <div className="esp-status-pill">
              <span className="esp-status-label">Trạng thái</span>
              <span
                className={`esp-status-badge esp-status-${session.status}`}
              >
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
                <span className="esp-stat-value">
                  {session.parts.length} phần
                </span>
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
                  Hoàn thành tất cả part trước khi ấn "Nộp kỳ thi"
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
              Mỗi Part là một bài thi riêng, kết quả sẽ được gộp lại cho toàn
              kỳ thi.
            </p>
          </div>
        </div>

        <div className="esp-part-grid">
          {session.parts.map((p, index) => {
            const examId = p.exam?._id || p.exam;

            return (
              <div
                key={index}
                className="esp-part-card esp-card-shadow esp-slide-up"
              >
                <div className="esp-part-header">
                  <span className="esp-part-index-badge">
                    PART {index + 1}
                  </span>
                  <h3 className="esp-part-title">
                    {p.label || p.exam?.title || `Bài thi ${index + 1}`}
                  </h3>
                </div>

                <div className="esp-part-meta">
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Bài thi</span>
                    <span className="esp-meta-value">
                      {p.exam?.title || "Không rõ"}
                    </span>
                  </div>
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Thứ tự</span>
                    <span className="esp-meta-value">{p.order}</span>
                  </div>
                  <div className="esp-part-meta-row">
                    <span className="esp-meta-label">Thời lượng</span>
                    <span className="esp-meta-value">
                      {p.durationMinutes} phút
                    </span>
                  </div>
                </div>

                <div className="esp-part-footer">
                  <div className="esp-part-status-box">
                    {renderPartStatus(examId)}
                  </div>

                  <button
                    className="esp-btn esp-btn-primary"
                    onClick={() => handleStartPart(examId, index)}
                    disabled={!!results[examId]}
                  >
                    {results[examId] ? "Đã hoàn thành" : "Làm Part này"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="esp-submit-wrapper">
          <button
            className="esp-btn esp-btn-submit"
            onClick={handleSubmitSession}
          >
            Nộp kỳ thi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamSessionPage;

// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import API from "../../api/http";
// import { toast } from "react-toastify";
// import "./DoExam.css";
// import { useAuth } from "../../context/AuthContext";

// function DoExam() {
//   const { examId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const userId = user?._id;

//   // Query parameters: ?session=...&part=...
//   const query = new URLSearchParams(location.search);
//   const sessionId = query.get("session");
//   const partIndex = query.get("part");
//   const isSessionMode = !!sessionId;

//   const [partInfo, setPartInfo] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [finished, setFinished] = useState(false);

//   // ============================================================
//   // LOAD QUESTIONS + PART INFO + PREVIOUS RESULTS (IF ANY)
//   // ============================================================
//   useEffect(() => {
//     const load = async () => {
//       try {
//         // Load Part Info (only in session mode)
//         if (isSessionMode && partIndex !== null) {
//           const res = await API.get(`/api/exam-sessions/${sessionId}`);
//           const session = res.data?.data;
//           const idx = Number(partIndex);
//           setPartInfo(session.parts[idx]);
//         }

//         // Load Questions
//         const resQ = await API.get(`/api/questions/exam/${examId}`);
//         setQuestions(resQ.data?.data || []);

//         // Check if already finished (session results)
//         if (isSessionMode && userId) {
//           const all = JSON.parse(localStorage.getItem("session_result") || "{}");

//           if (
//             all[userId] &&
//             all[userId][sessionId] &&
//             all[userId][sessionId][examId]
//           ) {
//             const saved = all[userId][sessionId][examId];
//             setFinished(true);
//             setAnswers(saved.answers || {});
//           }
//         }

//       } catch (err) {
//         console.error("❌ Lỗi load đề thi:", err);
//       }
//     };

//     load();
//   }, [examId, sessionId, partIndex, isSessionMode, userId]);

//   if (!questions.length)
//     return <div className="loading">Đang tải đề thi...</div>;

//   // ============================================================
//   // SELECT ANSWER
//   // ============================================================
//   const handleSelect = (qIndex, optIndex) => {
//     if (finished) return;
//     setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
//   };

//   // ============================================================
//   // RENDER PART 1 (ảnh + audio)
//   // ============================================================
//   const renderPart1 = (q, qIndex) => (
//     <div className="p1-container">
//       {q.imageUrl && <img src={q.imageUrl} className="part1-img" alt="" />}

//       <div className="p1-answer-list">
//         {["A", "B", "C", "D"].map((letter, idx) => (
//           <label key={idx} className="p1-answer-row">
//             <input
//               type="radio"
//               name={`q${qIndex}`}
//               checked={answers[qIndex] === idx}
//               disabled={finished}
//               onChange={() => handleSelect(qIndex, idx)}
//             />
//             <span className="p1-letter">{letter}</span>

//             {q.audioUrls?.[idx] && (
//               <audio controls className="p1-audio">
//                 <source src={q.audioUrls[idx]} />
//               </audio>
//             )}
//           </label>
//         ))}
//       </div>
//     </div>
//   );

//   // ============================================================
//   // FINISH PART (SESSION MODE)
//   // ============================================================
//   const finishPartInSession = () => {
//     let correct = 0;

//     questions.forEach((q, i) => {
//       if (answers[i] === q.answer) correct++;
//     });

//     const resultData = {
//       total: questions.length,
//       correct,
//       wrong: questions.length - correct,
//       answers,
//       questions,
//       examId,
//     };

//     // Save under: userId → sessionId → examId
//     const all = JSON.parse(localStorage.getItem("session_result") || "{}");

//     if (!all[userId]) all[userId] = {};
//     if (!all[userId][sessionId]) all[userId][sessionId] = {};

//     all[userId][sessionId][examId] = resultData;

//     localStorage.setItem("session_result", JSON.stringify(all));

//     navigate(`/exam-session/${sessionId}`);
//   };

//   // ============================================================
//   // SUBMIT SINGLE EXAM (standalone mode)
//   // ============================================================
// const submitSingleExam = async () => {
//   let correct = 0;

//   // Danh sách answer để lưu BE
//   const answerList = questions.map((q, i) => ({
//     questionId: q._id,
//     answerIndex: answers[i] ?? -1
//   }));

//   // Tính tổng đúng
//   questions.forEach((q, i) => {
//     if (answers[i] === q.answer) correct++;
//   });

//   // =========================================
//   // 🔥 GOM DỮ LIỆU THEO PART → REVIEW CẦN!!!!
//   // =========================================
//   const resultMap = {};

//   questions.forEach((q, i) => {
//     const part = q.partNumber || q.part || 1;

//     if (!resultMap[part]) {
//       resultMap[part] = {
//         correct: 0,
//         total: 0,
//         questions: [],
//         answers: []
//       };
//     }

//     // Add câu
//     resultMap[part].total++;
//     resultMap[part].questions.push({ answer: q.answer });
//     resultMap[part].answers.push(answers[i] ?? -1);

//     if (answers[i] === q.answer) resultMap[part].correct++;
//   });

//   // =========================================
//   // Chuẩn hóa phần `parts[]` để lưu BE
//   // =========================================
//   const parts = Object.entries(resultMap).map(([part, info]) => ({
//     examId,
//     label: `Part ${part}`,
//     correct: info.correct,
//     total: info.total,
//   }));

//   // =========================================
//   // Gửi lên backend
//   // =========================================
//   try {
//     await API.post("/api/session-results", {
//       sessionId: examId,
//       totalCorrect: correct,
//       totalQuestions: questions.length,
//       durationSeconds: 0,
//       parts,
//       answers: answerList
//     });

//     toast.success(`Bạn đúng ${correct}/${questions.length} câu!`);

//     // =========================================
//     // GỬI DỮ LIỆU ĐÚNG DẠNG CHO TRANG REVIEW
//     // =========================================
//     navigate(`/exam-session/${examId}/review`, {
//       state: {
//         mode: "practice",
//         results: resultMap,
//         totalCorrect: correct,
//         totalQuestions: questions.length
//       }
//     });

//   } catch (err) {
//     console.error("❌ Lỗi lưu kết quả:", err);
//   }
// };


//   // ============================================================
//   // RENDER UI
//   // ============================================================
//   return (
//     <div className="exam-container">
//       <h1 className="exam-title">
//         {isSessionMode ? `Part ${Number(partIndex) + 1}` : "Đề thi"}
//       </h1>

//       {partInfo && <h3 className="exam-sub">{partInfo.label}</h3>}

//       {questions.map((q, index) => (
//         <div key={index} className="question-card">
//           <h2 className="question-title">Câu {index + 1}</h2>

//           {q.partNumber === 1 ? (
//             renderPart1(q, index)
//           ) : (
//             <>
//               {q.audioUrls?.[0] && (
//                 <audio controls className="audio-big">
//                   <source src={q.audioUrls[0]} />
//                 </audio>
//               )}

//               <div className="option-list">
//                 {["A", "B", "C", "D"].map((letter, idx) => (
//                   <label key={idx} className="option-item">
//                     <input
//                       type="radio"
//                       name={`q${index}`}
//                       checked={answers[index] === idx}
//                       disabled={finished}
//                       onChange={() => handleSelect(index, idx)}
//                     />
//                     <span>{letter}</span>
//                   </label>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       ))}

//       {/* Submit buttons */}
//       {!isSessionMode ? (
//         <button className="btn-submit-exam" onClick={submitSingleExam}>
//           Nộp bài
//         </button>
//       ) : (
//         finished ? (
//           <button className="btn-submit-exam disabled" disabled>
//             Đã hoàn thành
//           </button>
//         ) : (
//           <button className="btn-submit-exam" onClick={finishPartInSession}>
//             Hoàn thành
//           </button>
//         )
//       )}
//     </div>
//   );
// }

// export default DoExam;
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../../api/http";
import { toast } from "react-toastify";
import "./DoExam.css";
import { useAuth } from "../../context/AuthContext";

function DoExam() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id;

  // Query parameters: ?session=...&part=...
  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session");
  const partIndex = query.get("part");
  const isSessionMode = !!sessionId;

  const [partInfo, setPartInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  // ✅ UI timer (không ảnh hưởng logic chấm điểm)
  const [seconds, setSeconds] = useState(0);

  // ============================================================
  // LOAD QUESTIONS + PART INFO + PREVIOUS RESULTS (IF ANY)
  // ============================================================
  useEffect(() => {
    const load = async () => {
      try {
        // Load Part Info (only in session mode)
        if (isSessionMode && partIndex !== null) {
          const res = await API.get(`/api/exam-sessions/${sessionId}`);
          const session = res.data?.data;
          const idx = Number(partIndex);
          setPartInfo(session.parts[idx]);
        }

        // Load Questions
        const resQ = await API.get(`/api/questions/exam/${examId}`);
        setQuestions(resQ.data?.data || []);

        // Check if already finished (session results)
        if (isSessionMode && userId) {
          const all = JSON.parse(localStorage.getItem("session_result") || "{}");

          if (
            all[userId] &&
            all[userId][sessionId] &&
            all[userId][sessionId][examId]
          ) {
            const saved = all[userId][sessionId][examId];
            setFinished(true);
            setAnswers(saved.answers || {});
          }
        }
      } catch (err) {
        console.error("❌ Lỗi load đề thi:", err);
      }
    };

    load();
  }, [examId, sessionId, partIndex, isSessionMode, userId]);

  // ✅ Timer chạy khi đã có questions, dừng khi finished
  useEffect(() => {
    if (!questions.length) return;
    if (finished) return;

    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [questions.length, finished]);

  const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const answeredCount = useMemo(() => {
    return questions.reduce(
      (acc, _, i) => acc + (answers[i] !== undefined ? 1 : 0),
      0
    );
  }, [questions, answers]);

  const scrollToQuestion = (index) => {
    const el = document.getElementById(`doex-q-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!questions.length) return <div className="doex-loading">Đang tải đề thi...</div>;

  // ============================================================
  // SELECT ANSWER
  // ============================================================
  const handleSelect = (qIndex, optIndex) => {
    if (finished) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  // ============================================================
  // RENDER PART 1 (ảnh + audio)
  // ============================================================
  const renderPart1 = (q, qIndex) => (
    <div className="doex-p1">
      {q.imageUrl && <img src={q.imageUrl} className="doex-p1-img" alt="" />}

      <div className="doex-p1-list">
        {["A", "B", "C", "D"].map((letter, idx) => (
          <label key={idx} className="doex-p1-row">
            <input
              type="radio"
              name={`q${qIndex}`}
              checked={answers[qIndex] === idx}
              disabled={finished}
              onChange={() => handleSelect(qIndex, idx)}
            />
            <span className="doex-p1-letter">{letter}</span>

            {q.audioUrls?.[idx] && (
              <audio controls className="doex-p1-audio">
                <source src={q.audioUrls[idx]} />
              </audio>
            )}
          </label>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // FINISH PART (SESSION MODE)
  // ============================================================
  const finishPartInSession = () => {
    let correct = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    const resultData = {
      total: questions.length,
      correct,
      wrong: questions.length - correct,
      answers,
      questions,
      examId,
    };

    // Save under: userId → sessionId → examId
    const all = JSON.parse(localStorage.getItem("session_result") || "{}");

    if (!all[userId]) all[userId] = {};
    if (!all[userId][sessionId]) all[userId][sessionId] = {};

    all[userId][sessionId][examId] = resultData;

    localStorage.setItem("session_result", JSON.stringify(all));

    navigate(`/exam-session/${sessionId}`);
  };

  // ============================================================
  // SUBMIT SINGLE EXAM (standalone mode)
  // ============================================================
  const submitSingleExam = async () => {
    let correct = 0;

    // Danh sách answer để lưu BE
    const answerList = questions.map((q, i) => ({
      questionId: q._id,
      answerIndex: answers[i] ?? -1,
    }));

    // Tính tổng đúng
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    // =========================================
    // 🔥 GOM DỮ LIỆU THEO PART → REVIEW CẦN!!!!
    // =========================================
    const resultMap = {};

    questions.forEach((q, i) => {
      const part = q.partNumber || q.part || 1;

      if (!resultMap[part]) {
        resultMap[part] = {
          correct: 0,
          total: 0,
          questions: [],
          answers: [],
        };
      }

      resultMap[part].total++;
      resultMap[part].questions.push({ answer: q.answer });
      resultMap[part].answers.push(answers[i] ?? -1);

      if (answers[i] === q.answer) resultMap[part].correct++;
    });

    const parts = Object.entries(resultMap).map(([part, info]) => ({
      examId,
      label: `Part ${part}`,
      correct: info.correct,
      total: info.total,
    }));

    try {
      await API.post("/api/session-results", {
        sessionId: examId,
        totalCorrect: correct,
        totalQuestions: questions.length,
        durationSeconds: 0,
        parts,
        answers: answerList,
      });

      toast.success(`Bạn đúng ${correct}/${questions.length} câu!`);

      navigate(`/exam-session/${examId}/review`, {
        state: {
          mode: "practice",
          results: resultMap,
          totalCorrect: correct,
          totalQuestions: questions.length,
        },
      });
    } catch (err) {
      console.error("❌ Lỗi lưu kết quả:", err);
    }
  };

  // ============================================================
  // RENDER UI (NEW LAYOUT)
  // ============================================================
  return (
    <div className="doex-page">
      {/* LEFT */}
      <div className="doex-left">
        <div className="doex-header">
          <h1 className="doex-title">
            {isSessionMode ? `Part ${Number(partIndex) + 1}` : "Đề thi"}
          </h1>
          {partInfo && <h3 className="doex-sub">{partInfo.label}</h3>}
        </div>

        {questions.map((q, index) => (
          <div key={index} id={`doex-q-${index}`} className="doex-card">
            <h2 className="doex-qtitle">Câu {index + 1}</h2>

            {q.partNumber === 1 ? (
              renderPart1(q, index)
            ) : (
              <>
                {q.audioUrls?.[0] && (
                  <audio controls className="doex-audio-big">
                    <source src={q.audioUrls[0]} />
                  </audio>
                )}

                <div className="doex-options">
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <label key={idx} className="doex-option">
                      <input
                        type="radio"
                        name={`q${index}`}
                        checked={answers[index] === idx}
                        disabled={finished}
                        onChange={() => handleSelect(index, idx)}
                      />
                      <span>{letter}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT (sticky 1/2 screen) */}
      <aside className="doex-right">
        <div className="doex-rightCard">
          <div className="doex-rightTop">
            <div className="doex-stat">
              <div className="doex-statLabel">Thời gian</div>
              <div className="doex-statValue">{formatTime(seconds)}</div>
            </div>

            <div className="doex-stat">
              <div className="doex-statLabel">Đã chọn</div>
              <div className="doex-statValue">
                {answeredCount}/{questions.length}
              </div>
            </div>
          </div>

          <div className="doex-nav">
            <div className="doex-navTitle">Danh sách câu</div>
            <div className="doex-grid">
              {questions.map((_, i) => {
                const picked = answers[i] !== undefined;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`doex-gridItem ${picked ? "isDone" : ""}`}
                    onClick={() => scrollToQuestion(i)}
                    title={picked ? `Câu ${i + 1}: đã chọn` : `Câu ${i + 1}: chưa chọn`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="doex-actions">
            {!isSessionMode ? (
              <button className="doex-submit" onClick={submitSingleExam}>
                Nộp bài
              </button>
            ) : finished ? (
              <button className="doex-submit isDisabled" disabled>
                Đã hoàn thành
              </button>
            ) : (
              <button className="doex-submit" onClick={finishPartInSession}>
                Hoàn thành
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default DoExam;

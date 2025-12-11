// import React, { useState, useEffect } from "react";
// import API from "../../../api/http";
// import { toast } from "react-toastify";
// import "./Part1Editor.css";
// import { FileSpreadsheet } from "lucide-react";

// function Part1Editor({ exam }) {
//   const [questions, setQuestions] = useState([]);
//   const [excelFile, setExcelFile] = useState(null);
//   const [zipFile, setZipFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [newQuestion, setNewQuestion] = useState({
//     imageUrl: "",
//     audioUrls: ["", "", "", ""],
//     answer: -1,
//   });

//   // ==========================================
//   // LOAD QUESTIONS
//   // ==========================================
//   useEffect(() => {
//     if (!exam?._id) return;
//     API.get(`/api/questions/${exam._id}`).then((res) => {
//       setQuestions(res.data.data || []);
//     });
//   }, [exam]);

//   // ==========================================
//   // IMPORT EXCEL (AUTO IMPORT)
//   // ==========================================
//   const handleExcelSelected = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setExcelFile(file);

//     const form = new FormData();
//     form.append("file", file);
//     form.append("examId", exam._id);

//     try {
//       setLoading(true);

//       const res = await API.post("/api/import/part1", form);

//       toast.success(`Import thành công ${res.data.count} câu Part 1!`, {
//         icon: false,
//       });

//       setQuestions((prev) => [...prev, ...res.data.data]);
//     } catch (err) {
//       console.error(err);
//       toast.error("Import Excel thất bại!", { icon: false });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // IMPORT ZIP (AUTO IMPORT)
//   // ==========================================
//   const handleZipSelected = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setZipFile(file);

//     const form = new FormData();
//     form.append("zip", file);
//     form.append("examId", exam._id);

//     try {
//       setLoading(true);

//       const res = await API.post("/api/import/part1-zip", form);

//       toast.success(`Import ZIP thành công: ${res.data.count} câu!`, {
//         icon: false,
//       });

//       setQuestions((prev) => [...prev, ...(res.data.data || [])]);
//     } catch (err) {
//       console.error(err);
//       toast.error("Import ZIP thất bại!", { icon: false });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================================
//   // UPLOAD FILES TỪNG CÂU
//   // ==========================================
//   const uploadImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const form = new FormData();
//     form.append("file", file);
//     const res = await API.post(`/api/upload/image`, form);

//     setNewQuestion({ ...newQuestion, imageUrl: res.data.url });
//     toast.success("Đã upload hình!", { icon: false });
//   };

//   const uploadAudio = async (e, index) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const form = new FormData();
//     form.append("file", file);
//     const res = await API.post(`/api/upload/audio`, form);

//     const arr = [...newQuestion.audioUrls];
//     arr[index] = res.data.url;

//     setNewQuestion({ ...newQuestion, audioUrls: arr });
//     toast.success(`Đã upload audio ${String.fromCharCode(65 + index)}!`, {
//       icon: false,
//     });
//   };

//   // ==========================================
//   // SAVE QUESTION
//   // ==========================================
//   const saveQuestion = async () => {
//     if (!newQuestion.imageUrl) return toast.error("Cần upload ảnh!", { icon: false });
//     if (newQuestion.audioUrls.some((a) => a === "")) 
//       return toast.error("Cần đủ 4 audio A/B/C/D!", { icon: false });
//     if (newQuestion.answer === -1)
//       return toast.error("Chưa chọn đáp án đúng!", { icon: false });

//     const res = await API.post(`/api/questions/${exam._id}`, {
//       ...newQuestion,
//       partNumber: 1,
//     });

//     setQuestions((prev) => [...prev, res.data.data]);
//     toast.success("Đã thêm câu!", { icon: false });

//     setNewQuestion({
//       imageUrl: "",
//       audioUrls: ["", "", "", ""],
//       answer: -1,
//     });
//   };

//   // ==========================================
//   // DELETE
//   // ==========================================
//   const deleteQuestion = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn xoá câu này?")) return;

//     try {
//       await API.delete(`/api/questions/${id}`);
//       setQuestions((prev) => prev.filter((q) => q._id !== id));
//       toast.success("Đã xoá câu hỏi!", { icon: false });
//     } catch (err) {
//       console.error(err);
//       toast.error("Lỗi khi xoá câu hỏi!", { icon: false });
//     }
//   };

//   return (
//     <div className="part1-container">

//       {/* LOADING OVERLAY */}
//       {loading && (
//         <div className="loading-overlay">
//           <div className="spinner"></div>
//         </div>
//       )}

//       <h2 className="title">TOEIC Part 1 — Ảnh + Audio mô tả</h2>

//       {/* IMPORT EXCEL + ZIP */}
//       <div className="import-box">

//         {/* Hidden Excel input */}
//         <input
//           type="file"
//           id="excelInput"
//           accept=".xlsx"
//           className="hidden"
//           onChange={handleExcelSelected}
//         />

//         <button
//           className="btn-import small-btn excel"
//           onClick={() => document.getElementById("excelInput").click()}
//         >
//           <FileSpreadsheet size={16} style={{ marginRight: 6 }} />
//           Import Excel
//         </button>

//         {/* Hidden ZIP input */}
//         <input
//           type="file"
//           accept=".zip"
//           className="hidden"
//           id="zipInput"
//           onChange={handleZipSelected}
//         />

//         <button
//           className="btn-import small-btn excel"
//           onClick={() => document.getElementById("zipInput").click()}
//         >
//           📦 Import ZIP
//         </button>
//       </div>

//       <hr />

//       {/* FORM TỰ NHẬP */}
//       {/* FORM TỰ NHẬP — UI MỚI */}
// <div className="part1-grid">
  
//   {/* LEFT — IMAGE UPLOAD */}
//   <div className="card upload-card">
//     <h3 className="card-title">Ảnh mô tả</h3>

//     <label className="upload-box">
//       <input type="file" accept="image/*" onChange={uploadImage} />
//       <span className="upload-text">📷 Chọn ảnh</span>
//     </label>

//     {newQuestion.imageUrl && (
//       <img src={newQuestion.imageUrl} className="preview-img" />
//     )}
//   </div>

//   {/* RIGHT — AUDIO UPLOAD */}
//   <div className="card upload-card">
//     <h3 className="card-title">Audio đáp án (A–D)</h3>

//     <div className="audio-list">
//       {["A", "B", "C", "D"].map((letter, i) => (
//         <div key={i} className="audio-row">

//           <span className="audio-letter">{letter}</span>

//           {/* Nút Upload */}
//           <label className={`audio-btn ${newQuestion.audioUrls[i] && "uploaded"}`}>
//             <input
//               type="file"
//               accept="audio/*"
//               onChange={(e) => uploadAudio(e, i)}
//             />
//             {newQuestion.audioUrls[i] ? "✓ Đã chọn" : "🎧 Upload Audio"}
//           </label>

//           {/* Preview */}
//           {newQuestion.audioUrls[i] && (
//             <audio controls className="audio-preview">
//               <source src={newQuestion.audioUrls[i]} />
//             </audio>
//           )}
//         </div>
//       ))}
//     </div>

//     {/* CHỌN ĐÁP ÁN */}
//     <div className="answer-select">
//       <p>Chọn đáp án đúng</p>

//       <div className="answer-options">
//         {["A", "B", "C", "D"].map((letter, i) => (
//           <label key={i} className="answer-option">
//             <input
//               type="radio"
//               name="answer"
//               checked={newQuestion.answer === i}
//               onChange={() => setNewQuestion({ ...newQuestion, answer: i })}
//             />
//             {letter}
//           </label>
//         ))}
//       </div>
//     </div>
//   </div>

// </div>


//       <button className="btn-save" onClick={saveQuestion}>
//         ➕ Lưu câu hỏi
//       </button>

//       <hr />

//       {/* LIST */}
//       <h3>Danh sách câu hỏi ({questions.length})</h3>

//       <div className="question-list">
//   {questions.map((q, index) => (
//     <div key={q._id} className="q-item">

//       <div className="q-number">Câu {index + 1}</div>

//       <button className="delete-btn" onClick={() => deleteQuestion(q._id)}>
//         🗑 Xóa
//       </button>

//       <img src={q.imageUrl} className="q-img" />

//       <div className="q-audios">
//         {q.audioUrls.map((au, i) => (
//           <div key={i}>
//             <b>{String.fromCharCode(65 + i)}.</b>
//             <audio controls className="audio-small">
//               <source src={au} />
//             </audio>
//           </div>
//         ))}
//       </div>

//       <p className="correct-answer">
//         Đáp án đúng: {String.fromCharCode(65 + q.answer)}
//       </p>
//     </div>
//   ))}
// </div>

//     </div>
//   );
// }

// export default Part1Editor;
import React, { useState, useEffect } from "react";
import API from "../../../api/http";
import { toast } from "react-toastify";
import "./Part1Editor.css";
import { FileSpreadsheet } from "lucide-react";

function Part1Editor({ exam }) {
  const [questions, setQuestions] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    imageUrl: "",
    audioUrls: ["", "", "", ""],
    answer: -1,
  });

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================
  useEffect(() => {
    if (!exam?._id) return;

    const fetchQuestions = async () => {
      try {
        // ✅ ĐÚNG VỚI BE: GET /api/questions/exam/:examId?part=1
        const res = await API.get(
          `/api/questions/exam/${exam._id}?part=1`
        );
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error("Load Part 1 questions error:", err);
        toast.error("Không tải được danh sách câu hỏi Part 1!", {
          icon: false,
        });
      }
    };

    fetchQuestions();
  }, [exam]);

  // ==========================================
  // IMPORT EXCEL (AUTO IMPORT)
  // ==========================================
  const handleExcelSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);

    const form = new FormData();
    form.append("file", file);
    form.append("examId", exam._id);

    try {
      setLoading(true);

      const res = await API.post("/api/import/part1", form);

      toast.success(`Import thành công ${res.data.count} câu Part 1!`, {
        icon: false,
      });

      setQuestions((prev) => [...prev, ...res.data.data]);
    } catch (err) {
      console.error(err);
      toast.error("Import Excel thất bại!", { icon: false });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // IMPORT ZIP (AUTO IMPORT)
  // ==========================================
  const handleZipSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setZipFile(file);

    const form = new FormData();
    form.append("zip", file);
    form.append("examId", exam._id);

    try {
      setLoading(true);

      const res = await API.post("/api/import/part1-zip", form);

      toast.success(`Import ZIP thành công: ${res.data.count} câu!`, {
        icon: false,
      });

      setQuestions((prev) => [...prev, ...(res.data.data || [])]);
    } catch (err) {
      console.error(err);
      toast.error("Import ZIP thất bại!", { icon: false });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPLOAD FILES TỪNG CÂU
  // ==========================================
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await API.post(`/api/upload/image`, form);
      setNewQuestion((prev) => ({ ...prev, imageUrl: res.data.url }));
      toast.success("Đã upload hình!", { icon: false });
    } catch (err) {
      console.error("Upload image error:", err);
      toast.error("Upload hình thất bại!", { icon: false });
    }
  };

  const uploadAudio = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await API.post(`/api/upload/audio`, form);

      const arr = [...newQuestion.audioUrls];
      arr[index] = res.data.url;

      setNewQuestion((prev) => ({ ...prev, audioUrls: arr }));
      toast.success(`Đã upload audio ${String.fromCharCode(65 + index)}!`, {
        icon: false,
      });
    } catch (err) {
      console.error("Upload audio error:", err);
      toast.error("Upload audio thất bại!", { icon: false });
    }
  };

  // ==========================================
  // SAVE QUESTION
  // ==========================================
  const saveQuestion = async () => {
    if (!newQuestion.imageUrl)
      return toast.error("Cần upload ảnh!", { icon: false });
    if (newQuestion.audioUrls.some((a) => a === ""))
      return toast.error("Cần đủ 4 audio A/B/C/D!", { icon: false });
    if (newQuestion.answer === -1)
      return toast.error("Chưa chọn đáp án đúng!", { icon: false });

    try {
      // ✅ ĐÚNG VỚI BE: POST /api/questions/exam/:examId
      const res = await API.post(`/api/questions/exam/${exam._id}`, {
        ...newQuestion,
        partNumber: 1,
      });

      setQuestions((prev) => [...prev, res.data.data]);
      toast.success("Đã thêm câu!", { icon: false });

      setNewQuestion({
        imageUrl: "",
        audioUrls: ["", "", "", ""],
        answer: -1,
      });
    } catch (err) {
      console.error("Save Part 1 question error:", err);
      toast.error("Lưu câu hỏi thất bại!", { icon: false });
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const deleteQuestion = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá câu này?")) return;

    try {
      // ✅ ĐÚNG VỚI BE: DELETE /api/questions/id/:questionId
      await API.delete(`/api/questions/id/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("Đã xoá câu hỏi!", { icon: false });
    } catch (err) {
      console.error("Delete Part 1 question error:", err);
      toast.error("Lỗi khi xoá câu hỏi!", { icon: false });
    }
  };

  return (
    <div className="part1-container">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <h2 className="title">TOEIC Part 1 — Ảnh + Audio mô tả</h2>

      {/* IMPORT EXCEL + ZIP */}
      <div className="import-box">
        {/* Hidden Excel input */}
        <input
          type="file"
          id="excelInput"
          accept=".xlsx"
          className="hidden"
          onChange={handleExcelSelected}
        />

        <button
          className="btn-import small-btn excel"
          onClick={() => document.getElementById("excelInput").click()}
        >
          <FileSpreadsheet size={16} style={{ marginRight: 6 }} />
          Import Excel
        </button>

        {/* Hidden ZIP input */}
        <input
          type="file"
          accept=".zip"
          className="hidden"
          id="zipInput"
          onChange={handleZipSelected}
        />

        <button
          className="btn-import small-btn excel"
          onClick={() => document.getElementById("zipInput").click()}
        >
          📦 Import ZIP
        </button>
      </div>

      <hr />

      {/* FORM TỰ NHẬP — UI MỚI */}
      <div className="part1-grid">
        {/* LEFT — IMAGE UPLOAD */}
        <div className="card upload-card">
          <h3 className="card-title">Ảnh mô tả</h3>

          <label className="upload-box">
            <input type="file" accept="image/*" onChange={uploadImage} />
            <span className="upload-text">📷 Chọn ảnh</span>
          </label>

          {newQuestion.imageUrl && (
            <img src={newQuestion.imageUrl} className="preview-img" />
          )}
        </div>

        {/* RIGHT — AUDIO UPLOAD */}
        <div className="card upload-card">
          <h3 className="card-title">Audio đáp án (A–D)</h3>

          <div className="audio-list">
            {["A", "B", "C", "D"].map((letter, i) => (
              <div key={i} className="audio-row">
                <span className="audio-letter">{letter}</span>

                {/* Nút Upload */}
                <label
                  className={`audio-btn ${
                    newQuestion.audioUrls[i] && "uploaded"
                  }`}
                >
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => uploadAudio(e, i)}
                  />
                  {newQuestion.audioUrls[i]
                    ? "✓ Đã chọn"
                    : "🎧 Upload Audio"}
                </label>

                {/* Preview */}
                {newQuestion.audioUrls[i] && (
                  <audio controls className="audio-preview">
                    <source src={newQuestion.audioUrls[i]} />
                  </audio>
                )}
              </div>
            ))}
          </div>

          {/* CHỌN ĐÁP ÁN */}
          <div className="answer-select">
            <p>Chọn đáp án đúng</p>

            <div className="answer-options">
              {["A", "B", "C", "D"].map((letter, i) => (
                <label key={i} className="answer-option">
                  <input
                    type="radio"
                    name="answer"
                    checked={newQuestion.answer === i}
                    onChange={() =>
                      setNewQuestion((prev) => ({ ...prev, answer: i }))
                    }
                  />
                  {letter}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="btn-save" onClick={saveQuestion}>
        ➕ Lưu câu hỏi
      </button>

      <hr />

      {/* LIST */}
      <h3>Danh sách câu hỏi ({questions.length})</h3>

      <div className="question-list">
        {questions.map((q, index) => (
          <div key={q._id} className="q-item">
            <div className="q-number">Câu {index + 1}</div>

            <button
              className="delete-btn"
              onClick={() => deleteQuestion(q._id)}
            >
              🗑 Xóa
            </button>

            <img src={q.imageUrl} className="q-img" />

            <div className="q-audios">
              {q.audioUrls.map((au, i) => (
                <div key={i}>
                  <b>{String.fromCharCode(65 + i)}.</b>
                  <audio controls className="audio-small">
                    <source src={au} />
                  </audio>
                </div>
              ))}
            </div>

            <p className="correct-answer">
              Đáp án đúng: {String.fromCharCode(65 + q.answer)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Part1Editor;

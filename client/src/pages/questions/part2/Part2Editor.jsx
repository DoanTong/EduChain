import React, { useState, useEffect } from "react";
import API from "../../../api/http";
import { toast } from "react-toastify";
import "./Part2Editor.css";
import { FileSpreadsheet } from "lucide-react";

function Part2Editor({ exam }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // file excel + zip
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    audioUrls: [],
    answer: -1,
  });

  // =======================
  // LOAD LIST QUESTIONS
  // =======================
  useEffect(() => {
    if (!exam?._id) return;

    API.get(`/api/questions/${exam._id}?part=2`).then((res) => {
      setQuestions(res.data.data || []);
    });
  }, [exam]);

  // =======================
  // IMPORT EXCEL (AUTO)
  // =======================
  const handleExcelSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);

    const form = new FormData();
    form.append("file", file);
    form.append("examId", exam._id);

    try {
      setLoading(true);

      const res = await API.post("/api/import/part2", form);

      toast.success(`Import Excel thành công ${res.data.count} câu!`, {
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

  // =======================
  // IMPORT ZIP (AUTO)
  // =======================
  const handleZipSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setZipFile(file);

    const form = new FormData();
    form.append("zip", file);
    form.append("examId", exam._id);

    try {
      setLoading(true);

      const res = await API.post("/api/import/part2-zip", form);

      toast.success(`Import ZIP thành công: ${res.data.count} audio!`, {
        icon: false,
      });
    } catch (err) {
      console.error(err);
      toast.error("Import ZIP thất bại!", { icon: false });
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // UPLOAD AUDIO MANUAL
  // =======================
  const uploadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await API.post("/api/upload/audio", form);

    setNewQuestion({ ...newQuestion, audioUrls: [res.data.url] });

    toast.success("Đã upload audio câu hỏi!", { icon: false });
  };

  // =======================
  // SAVE MANUAL QUESTION
  // =======================
  const saveQuestion = async () => {
    if (!newQuestion.audioUrls.length)
      return toast.error("Cần upload audio câu hỏi!", { icon: false });

    if (newQuestion.answer === -1)
      return toast.error("Chưa chọn đáp án đúng!", { icon: false });

    const res = await API.post(`/api/questions/${exam._id}`, {
      partNumber: 2,
      audioUrls: newQuestion.audioUrls,
      options: [],
      answer: newQuestion.answer,
    });

    toast.success("Đã thêm câu Part 2!", { icon: false });

    setQuestions((prev) => [...prev, res.data.data]);

    setNewQuestion({ audioUrls: [], answer: -1 });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Bạn chắc muốn xoá câu này?")) return;

    await API.delete(`/api/questions/${id}`);
    setQuestions((prev) => prev.filter((q) => q._id !== id));
    toast.success("Đã xoá câu hỏi!", { icon: false });
  };

  return (
    <div className="part2-container">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <h2 className="title">TOEIC Part 2 — Import giống Part 1</h2>

      {/* IMPORT EXCEL + ZIP */}
      <div className="import-box">

        {/* EXCEL */}
        <input
          type="file"
          id="excelInputPart2"
          className="hidden"
          accept=".xlsx"
          onChange={handleExcelSelected}
        />
        <button
          className="btn-import"
          onClick={() => document.getElementById("excelInputPart2").click()}
        >
          <FileSpreadsheet size={16} style={{ marginRight: 6 }} />
          Import Excel
        </button>

        {/* ZIP */}
        <input
          type="file"
          id="zipInputPart2"
          className="hidden"
          accept=".zip"
          onChange={handleZipSelected}
        />
        <button
          className="btn-import"
          onClick={() => document.getElementById("zipInputPart2").click()}
        >
          📦 Import ZIP
        </button>

      </div>

      <hr />

      {/* FORM MANUAL */}
      <div className="part2-grid">

        <div className="card upload-card">
          <h3 className="card-title">Audio câu hỏi</h3>

          <label className="upload-box">
            <input type="file" accept="audio/*" onChange={uploadAudio} />
            <span className="upload-text">🎤 Upload Audio</span>
          </label>

          {newQuestion.audioUrls[0] && (
            <audio controls className="audio-preview">
              <source src={newQuestion.audioUrls[0]} />
            </audio>
          )}
        </div>

        <div className="card upload-card">
          <h3 className="card-title">Chọn đáp án đúng</h3>

          <div className="answer-options">
            {["A", "B", "C"].map((l, i) => (
              <label key={i} className="answer-option">
                <input
                  type="radio"
                  name="ans"
                  checked={newQuestion.answer === i}
                  onChange={() => setNewQuestion({ ...newQuestion, answer: i })}
                />
                {l}
              </label>
            ))}
          </div>
        </div>

      </div>

      <button className="btn-save" onClick={saveQuestion}>
        ➕ Lưu câu hỏi
      </button>

      <hr />

      <h3>Danh sách câu hỏi ({questions.length})</h3>

      <div className="question-list">
        {questions.map((q, index) => (
          <div key={q._id} className="q-item">
            <div className="q-number">Câu {index + 1}</div>

            <button className="delete-btn" onClick={() => deleteQuestion(q._id)}>
              🗑 Xóa
            </button>

            <audio controls className="audio-small">
              <source src={q.audioUrls[0]} />
            </audio>

            <p className="correct-answer">
              Đáp án đúng: {["A", "B", "C"][q.answer]}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Part2Editor;

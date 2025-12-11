// src/pages/questions/Part5Editor.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/http";
import { toast } from "react-toastify";
import { FileSpreadsheet, Code, PlusCircle, Pencil, XCircle } from "lucide-react";

function Part5Editor({ exam, examId }) {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    editId: null,
  });

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const qRes = await API.get(`/api/questions/${examId}`);
        setQuestions(qRes.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được danh sách câu hỏi");
      }
    };
    fetchQuestions();
  }, [examId]);

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await API.post(`/api/exams/${examId}/import-excel`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `Import thành công ${res.data.added} câu hỏi từ file: ${file.name}`,
        { autoClose: 2500 }
      );

      const qRes = await API.get(`/api/questions/${examId}`);
      setQuestions(qRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Import Excel thất bại!");
    }
  };

  const handleImportJSON = async () => {
    try {
      const parsed = JSON.parse(jsonText);

      const res = await API.post(`/api/exams/${examId}/import-json`, {
        questions: parsed,
      });

      toast.success(`Import JSON thành công: ${res.data.added} câu hỏi!`, {
        autoClose: 2500,
      });

      setShowJsonModal(false);

      const qRes = await API.get(`/api/questions/${examId}`);
      setQuestions(qRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("JSON sai cấu trúc, vui lòng kiểm tra lại!");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

    try {
      await API.delete(`/api/questions/${examId}/${questionId}`);
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
      toast.success("Đã xoá câu hỏi");
    } catch (err) {
      console.error(err);
      toast.error("Xoá câu hỏi thất bại");
    }
  };

  const handleEditQuestion = (question) => {
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      answer: question.answer,
      editId: question._id,
    });
  };

  const handleSaveQuestion = async () => {
    if (!newQuestion.question.trim())
      return toast.warn("Vui lòng nhập nội dung câu hỏi");

    if (newQuestion.options.some((o) => !o.trim()))
      return toast.warn("Vui lòng nhập đầy đủ 4 đáp án");

    const payload = {
      ...newQuestion,
      partNumber: exam.partNumber,
      type: "P5",
    };

    const { editId } = newQuestion;

    try {
      if (editId) {
        const res = await API.put(
          `/api/questions/${examId}/${editId}`,
          payload
        );

        setQuestions((prev) =>
          prev.map((q) => (q._id === editId ? res.data.data : q))
        );

        toast.success("Đã cập nhật câu hỏi!");
      } else {
        const res = await API.post(`/api/questions/${examId}`, payload);
        setQuestions((prev) => [...prev, res.data.data]);
        toast.success("Đã thêm câu hỏi");
      }

      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        answer: 0,
        editId: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Lưu câu hỏi thất bại");
    }
  };

  return (
    <>
      <div className="qe-layout">
        <div className="qe-card qe-form">
          <h3>{newQuestion.editId ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}</h3>

          <label className="qe-label">Nội dung câu hỏi</label>
          <input
            className="qe-input"
            placeholder="Nhập nội dung câu hỏi..."
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question: e.target.value })
            }
          />

          <label className="qe-label">Các đáp án</label>
          {newQuestion.options.map((op, idx) => (
            <input
              key={idx}
              className="qe-input"
              placeholder={`Đáp án ${idx + 1}`}
              value={op}
              onChange={(e) => {
                const opts = [...newQuestion.options];
                opts[idx] = e.target.value;
                setNewQuestion({ ...newQuestion, options: opts });
              }}
            />
          ))}

          <label className="qe-label">Đáp án đúng</label>
          <select
            className="qe-select"
            value={newQuestion.answer}
            onChange={(e) =>
              setNewQuestion({
                ...newQuestion,
                answer: Number(e.target.value),
              })
            }
          >
            <option value={0}>Đáp án 1</option>
            <option value={1}>Đáp án 2</option>
            <option value={2}>Đáp án 3</option>
            <option value={3}>Đáp án 4</option>
          </select>

          <div className="qe-import-group">
            <div className="import-row">
              <button
                className="btn-import small-btn excel"
                onClick={() => document.getElementById("excelInput").click()}
              >
                <FileSpreadsheet size={16} /> Excel
              </button>

              <input
                id="excelInput"
                type="file"
                accept=".xlsx"
                style={{ display: "none" }}
                onChange={handleImportExcel}
              />

              <button
                className="btn-import small-btn json"
                onClick={() => setShowJsonModal(true)}
              >
                <Code size={16} /> JSON
              </button>
            </div>

            <div className="add-row">
              <button className="qe-btn-primary" onClick={handleSaveQuestion}>
                {newQuestion.editId ? (
                  <>
                    <PlusCircle size={18} /> Cập nhật câu hỏi
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} /> Thêm câu hỏi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="qe-card qe-list">
          <h3>Danh sách câu hỏi ({questions.length})</h3>

          {questions.length === 0 ? (
            <p className="qe-empty">Chưa có câu hỏi nào.</p>
          ) : (
            <div className="qe-items">
              {questions.map((q, idx) => (
                <div className="qe-item" key={q._id || idx}>
                  <div className="qe-item-header">
                    <span className="qe-item-index">CÂU {idx + 1}</span>

                    <div className="qe-item-actions">
                      <button
                        className="qe-btn-edit"
                        onClick={() => handleEditQuestion(q)}
                      >
                        <Pencil size={16} /> Sửa
                      </button>

                      <button
                        className="qe-btn-delete"
                        onClick={() => handleDeleteQuestion(q._id)}
                      >
                        <XCircle size={16} /> Xóa
                      </button>
                    </div>
                  </div>

                  <div className="qe-question-text">{q.question}</div>

                  <ul className="qe-options">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`qe-option ${
                          i === q.answer ? "correct" : ""
                        }`}
                      >
                        <span className="qe-option-prefix">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showJsonModal && (
        <div className="qe-json-modal">
          <div className="qe-json-card">
            <h3>Import JSON</h3>

            <textarea
              className="qe-json-textarea"
              placeholder='[{"question":"?","options":["A","B","C","D"],"answer":0}]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />

            <div className="qe-json-actions">
              <button
                className="qe-btn-cancel"
                onClick={() => setShowJsonModal(false)}
              >
                Đóng
              </button>

              <button className="qe-btn-save" onClick={handleImportJSON}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Part5Editor;

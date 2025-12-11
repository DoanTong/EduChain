import React, { useEffect, useState } from "react";
import API from "../../api/http";
import { toast } from "react-toastify";
import { PlusCircle, XCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function Part7Editor({ exam, examId }) {
  const [groups, setGroups] = useState([]);
  const [groupKey, setGroupKey] = useState(null);

  // Data khi tạo nhóm mới
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState([]);

  // ================================================
  // LOAD QUESTIONS, NHÓM THEO groupKey
  // ================================================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/api/questions/${examId}`);
        const data = res.data?.data || [];

        const byGroup = {};
        data.forEach((q) => {
          if (!byGroup[q.groupKey])
            byGroup[q.groupKey] = { passage: q.passage, items: [] };
          byGroup[q.groupKey].items.push(q);
        });

        setGroups(
          Object.entries(byGroup).map(([key, val]) => ({
            groupKey: key,
            ...val,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách câu hỏi");
      }
    };

    load();
  }, [examId]);

  // ================================================
  // TẠO NHÓM MỚI
  // ================================================
  const createNewGroup = () => {
    const newKey = uuidv4();
    setGroupKey(newKey);
    setPassage("");
    setQuestions([]);
    toast.info("Đang tạo nhóm Part 7 mới...");
  };

  // ================================================
  // THÊM 1 CÂU HỎI TRONG NHÓM
  // ================================================
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        answer: 0,
      },
    ]);
  };

  // ================================================
  // LƯU NHÓM
  // ================================================
  const saveGroup = async () => {
    if (!passage.trim()) return toast.warn("⚠ Vui lòng nhập đoạn văn");
    if (questions.length === 0) return toast.warn("⚠ Cần ít nhất 1 câu hỏi");

    try {
      for (let q of questions) {
        await API.post(`/api/questions/${examId}`, {
          ...q,
          passage,
          groupKey,
          partNumber: exam.partNumber,
          type: "P7",
        });
      }

      toast.success("Đã lưu nhóm câu hỏi Part 7!");

      // Reload UI
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("❌ Lưu nhóm thất bại");
    }
  };

  return (
    <div className="qe-layout">
      {/* ================= NEW GROUP FORM ================= */}
      <div className="qe-card qe-form">
        <h3>Part 7 — Reading Comprehension</h3>

        <button className="qe-btn-primary" onClick={createNewGroup}>
          <PlusCircle size={18} /> Tạo nhóm bài đọc mới
        </button>

        {/* Form tạo nhóm */}
        {groupKey && (
          <>
            <label className="qe-label">Đoạn văn bài đọc</label>
            <textarea
              className="qe-input"
              rows={6}
              placeholder="Nhập đoạn văn dài ở đây..."
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />

            <button className="qe-btn-primary" onClick={addQuestion}>
              <PlusCircle size={18} /> Thêm câu hỏi
            </button>

            {questions.map((q, idx) => (
              <div key={idx} className="qe-subcard">
                <h4>Câu hỏi {idx + 1}</h4>

                <input
                  className="qe-input"
                  placeholder="Nhập nội dung câu hỏi..."
                  value={q.question}
                  onChange={(e) => {
                    const arr = [...questions];
                    arr[idx].question = e.target.value;
                    setQuestions(arr);
                  }}
                />

                {q.options.map((opt, i) => (
                  <input
                    key={i}
                    className="qe-input"
                    placeholder={`Đáp án ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const arr = [...questions];
                      arr[idx].options[i] = e.target.value;
                      setQuestions(arr);
                    }}
                  />
                ))}

                <label>Đáp án đúng</label>
                <select
                  className="qe-select"
                  value={q.answer}
                  onChange={(e) => {
                    const arr = [...questions];
                    arr[idx].answer = Number(e.target.value);
                    setQuestions(arr);
                  }}
                >
                  <option value={0}>Đáp án 1</option>
                  <option value={1}>Đáp án 2</option>
                  <option value={2}>Đáp án 3</option>
                  <option value={3}>Đáp án 4</option>
                </select>
              </div>
            ))}

            {/* SAVE */}
            <button className="qe-btn-primary" onClick={saveGroup}>
              <PlusCircle size={18} /> Lưu nhóm câu hỏi
            </button>
          </>
        )}
      </div>

      {/* ================= LIST GROUPS ================= */}
      <div className="qe-card qe-list">
        <h3>Các bài đọc đã tạo ({groups.length})</h3>

        {groups.length === 0 ? (
          <p className="qe-empty">Chưa có nhóm Part 7 nào.</p>
        ) : (
          groups.map((g, idx) => (
            <div key={g.groupKey} className="qe-item">
              <h4>Bài đọc {idx + 1}</h4>

              <div className="qe-passage-box">
                <strong>Đoạn văn:</strong>
                <p>{g.passage}</p>
              </div>

              <ul className="qe-options">
                {g.items.map((q, i) => (
                  <li key={q._id} className="qe-option">
                    <strong>Câu {i + 1}: </strong>
                    {q.question}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Part7Editor;

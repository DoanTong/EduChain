import React, { useEffect, useState } from "react";
import API from "../../api/http";
import { toast } from "react-toastify";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function Part6Editor({ exam, examId }) {
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupKey, setGroupKey] = useState(null);

  useEffect(() => {
    API.get(`/api/questions/${examId}`).then((res) => {
      const data = res.data?.data || [];
      const byGroup = {};

      data.forEach((q) => {
        if (!byGroup[q.groupKey]) byGroup[q.groupKey] = { passage: q.passage, items: [] };
        byGroup[q.groupKey].items.push(q);
      });

      setGroups(Object.entries(byGroup).map(([k, v]) => ({ groupKey: k, ...v })));
    });
  }, [examId]);

  const addGroup = () => {
    const newKey = uuidv4();
    setGroupKey(newKey);
    setPassage("");
    setQuestions([]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const saveGroup = async () => {
    if (!passage.trim()) return toast.warn("Nhập đoạn văn trước.");
    if (questions.length === 0) return toast.warn("Cần ít nhất 1 câu hỏi.");

    try {
      for (let q of questions) {
        await API.post(`/api/questions/${examId}`, {
          ...q,
          passage,
          groupKey,
          partNumber: exam.partNumber,
          type: "P6",
        });
      }

      toast.success("Đã lưu nhóm Part 6!");
      window.location.reload();
    } catch (err) {
      toast.error("Lưu thất bại");
    }
  };

  return (
    <div className="qe-layout">
      <div className="qe-card qe-form">
        <h3>Part 6 — Điền đoạn văn</h3>

        <button className="qe-btn-primary" onClick={addGroup}>
          <PlusCircle /> Tạo nhóm mới
        </button>

        <label>Đoạn văn</label>
        <textarea
          className="qe-input"
          value={passage}
          onChange={(e) => setPassage(e.target.value)}
        />

        <button className="qe-btn-primary" onClick={addQuestion}>
          Thêm 1 câu hỏi
        </button>

        {questions.map((q, idx) => (
          <div key={idx} className="qe-subcard">
            <h4>Câu hỏi {idx + 1}</h4>

            <input
              className="qe-input"
              placeholder="Nội dung câu hỏi"
              value={q.question}
              onChange={(e) => {
                const arr = [...questions];
                arr[idx].question = e.target.value;
                setQuestions(arr);
              }}
            />

            {q.options.map((op, i) => (
              <input
                key={i}
                className="qe-input"
                placeholder={`Đáp án ${i + 1}`}
                value={op}
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

        <button className="qe-btn-primary" onClick={saveGroup}>
          <PlusCircle /> Lưu nhóm câu hỏi
        </button>
      </div>

      <div className="qe-card qe-list">
        <h3>Các nhóm đã tạo</h3>
        {groups.map((g, idx) => (
          <div key={g.groupKey} className="qe-item">
            <h4>Nhóm {idx + 1}</h4>
            <p className="qe-pass">{g.passage}</p>

            <ul>
              {g.items.map((q, i) => (
                <li key={q._id}>
                  <strong>Câu {i + 1}:</strong> {q.question}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Part6Editor;

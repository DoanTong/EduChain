import React, { useState, useEffect } from "react";
import API from "../../../api/http";
import { toast } from "react-toastify";
import "./Part3Editor.css";

function Part3Editor({ exam }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newGroup, setNewGroup] = useState({
    audioUrl: "",
    questions: [
      { questionText: "", options: ["", "", "", ""], answer: -1 },
      { questionText: "", options: ["", "", "", ""], answer: -1 },
      { questionText: "", options: ["", "", "", ""], answer: -1 }
    ]
  });

  // =======================================
  // LOAD PART 3 GROUPS
  // =======================================
  useEffect(() => {
    if (!exam?._id) return;

    API.get(`/api/questions/exam/${exam._id}?part=3`).then((res) => {
      const raw = res.data.data || [];

      const map = {};

      raw.forEach((q) => {
        if (!q) return;

        const key = q.groupKey || "no-group";

        if (!map[key]) {
          map[key] = {
            groupKey: key,
            audioUrl: q.audioUrls?.[0] || "",
            questions: []
          };
        }

        map[key].questions.push({
          questionText: q.questionText || "",
          options: q.options || [],
          answer: q.answer
        });
      });

      setGroups(Object.values(map));
    });
  }, [exam]);

  // =======================================
  // UPLOAD AUDIO
  // =======================================
  const uploadAudio = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const form = new FormData();
    form.append("file", f);

    const res = await API.post("/api/upload/audio", form);
    setNewGroup({ ...newGroup, audioUrl: res.data.url });
    toast.success("Đã upload audio!");
  };

  // =======================================
  // SAVE NEW GROUP
  // =======================================
  const saveGroup = async () => {
    if (!newGroup.audioUrl) return toast.error("Thiếu audio!");

    for (let i = 0; i < 3; i++) {
      const q = newGroup.questions[i];
      if (!q.questionText.trim()) return toast.error(`Câu ${i + 1} thiếu nội dung`);
      if (q.options.some((op) => !op.trim())) return toast.error(`Câu ${i + 1} thiếu đáp án`);
      if (q.answer === -1) return toast.error(`Câu ${i + 1} chưa chọn đáp án`);
    }

    try {
      setLoading(true);

      const res = await API.post("/api/questions/part3/manual", {
        examId: exam._id,
        audioUrl: newGroup.audioUrl,
        questions: newGroup.questions
      });

      setGroups([...groups, res.data.data]);

      toast.success("Đã thêm nhóm!");

      // reset input
      setNewGroup({
        audioUrl: "",
        questions: [
          { questionText: "", options: ["", "", "", ""], answer: -1 },
          { questionText: "", options: ["", "", "", ""], answer: -1 },
          { questionText: "", options: ["", "", "", ""], answer: -1 }
        ]
      });

    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo nhóm!");
    }

    setLoading(false);
  };

  // =======================================
  // DELETE GROUP (groupKey)
  // =======================================
  const deleteGroup = async (key) => {
    if (!window.confirm("Xoá toàn bộ nhóm này?")) return;

    try {
      await API.delete(`/api/questions/group/${key}`);
      setGroups(groups.filter((g) => g.groupKey !== key));
      toast.success("Đã xoá nhóm!");
    } catch (err) {
      console.error(err);
      toast.error("Không xoá được nhóm!");
    }
  };

  return (
    <div className="part3-container">

      {loading && (
        <div className="part3-loading-overlay">
          <div className="part3-spinner"></div>
        </div>
      )}

      <h2 className="part3-title">TOEIC Part 3 — Đoạn hội thoại (3 câu)</h2>

        {/* FORM INPUT */}
        <div className="part3-form-grid">

          {/* LEFT — AUDIO */}
          <div className="part3-card">

            <h3 className="part3-card-title">Audio nhóm</h3>

                  <label className="part3-upload-box">
                    <input type="file" accept="audio/*" onChange={uploadAudio} />
                    <span className="part3-upload-text">🎤 Upload Audio</span>
                  </label>

                  {newGroup.audioUrl && (
                    <audio controls className="part3-audio-preview">
                      <source src={newGroup.audioUrl} />
                    </audio>
                  )}

                </div>

                {/* RIGHT — 3 QUESTIONS */}
                <div className="part3-card">

                  <h3 className="part3-card-title">Nội dung 3 câu hỏi</h3>

                  {newGroup.questions.map((q, i) => (
                    <div key={i} className="part3-question-block">
                      <h4 className="part3-question-header">Câu {i + 1}</h4>

                      <textarea
                        className="part3-question-text"
                        placeholder="Nhập nội dung câu hỏi"
                        value={q.questionText}
                        onChange={(e) => {
                          const arr = [...newGroup.questions];
                          arr[i].questionText = e.target.value;
                          setNewGroup({ ...newGroup, questions: arr });
                        }}
                      />

                      <div className="part3-options-grid">
                        {["A", "B", "C", "D"].map((l, idx) => (
                          <div key={idx} className="part3-option-row">
                            <span className="part3-option-label">{l}.</span>
                            <input
                              className="part3-option-input"
                              value={q.options[idx]}
                              placeholder={`Đáp án ${l}`}
                              onChange={(e) => {
                                const arr = [...newGroup.questions];
                                arr[i].options[idx] = e.target.value;
                                setNewGroup({ ...newGroup, questions: arr });
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="part3-answer-select">
                        <span>Đáp án đúng:</span>
                        <div className="part3-answer-options">
                          {["A", "B", "C", "D"].map((l, idx) => (
                            <label key={idx} className="part3-answer-option">
                              <input
                                type="radio"
                                name={`answer-${i}`}
                                checked={q.answer === idx}
                                onChange={() => {
                                  const arr = [...newGroup.questions];
                                  arr[i].answer = idx;
                                  setNewGroup({ ...newGroup, questions: arr });
                                }}
                              />
                              {l}
                            </label>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}

                </div>

        </div>

        <div className="part3-save-wrapper">
          <button className="part3-btn-save" onClick={saveGroup}>➕ Lưu nhóm</button>
        </div>


      <hr />

      {/* LIST GROUP */}
      <div className="part3-group-list">
        {groups.map((g) => (
          <div key={g.groupKey} className="part3-group-item">

            <button
              className="part3-delete-group-btn"
              onClick={() => deleteGroup(g.groupKey)}
            >
              🗑 Xóa câu
            </button>

            <audio controls className="part3-full-audio">
              <source src={g.audioUrl} />
            </audio>

            {g.questions.map((q, i) => (
              <div key={i} className="part3-question-view">
                <div className="part3-question-number">{i + 1}</div>
                <div className="part3-question-text-view">{q.questionText}</div>

                <div className="part3-options-list">
                  {q.options.map((op, idx) => (
                    <label key={idx} className="part3-option-item">
                      <input
                        type="radio"
                        readOnly
                        checked={q.answer === idx}
                      />
                      <span className={q.answer === idx ? "part3-option-correct" : ""}>
                        {String.fromCharCode(65 + idx)}. {op}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

          </div>
        ))}
      </div>

    </div>
  );
}

export default Part3Editor;

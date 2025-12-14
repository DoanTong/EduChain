import React, { useState, useEffect } from "react";
import API from "../../../api/http";
import { toast } from "react-toastify";
import "./Part3Editor.css";
import { FileSpreadsheet } from "lucide-react";

function Part3Editor({ exam, partNumber }) {
  const PART = partNumber ?? exam?.partNumber ?? 3; // default = 3
  const partLabel = PART === 4 ? "Bài nói ngắn" : "Đoạn hội thoại";

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // file excel + zip (giống Part2)
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);

  const [newGroup, setNewGroup] = useState({
    audioUrl: "",
    questions: [
      { questionText: "", options: ["", "", "", ""], answer: -1 },
      { questionText: "", options: ["", "", "", ""], answer: -1 },
      { questionText: "", options: ["", "", "", ""], answer: -1 },
    ],
  });

  // =======================================
  // LOAD GROUPS (Part 3/4)
  // =======================================
  const fetchGroups = async () => {
    if (!exam?._id) return;

    const res = await API.get(`/api/questions/exam/${exam._id}?part=${PART}`);
    const raw = res.data.data || [];

    const map = {};
    raw.forEach((q) => {
      if (!q) return;

      const key = q.groupKey || "no-group";

      if (!map[key]) {
        map[key] = {
          groupKey: key,
          audioUrl: q.audioUrls?.[0] || "",
          questions: [],
        };
      }

      map[key].questions.push({
        questionText: q.questionText || "",
        options: q.options?.length ? q.options : ["", "", "", ""],
        answer: q.answer ?? -1,
      });
    });

    setGroups(Object.values(map));
  };

  useEffect(() => {
    fetchGroups().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, PART]);

  // =======================
  // IMPORT EXCEL (AUTO) — giống Part2
  // POST /api/import/part3 (multipart: file + examId + partNumber)
  // =======================
  const handleExcelSelected = async (e) => {
    if (!exam?._id) return toast.error("Thiếu exam!", { icon: false });

    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);

    const form = new FormData();
    form.append("file", file); // upload.single("file")
    form.append("examId", exam._id);
    form.append("partNumber", String(PART)); // ✅ thêm để BE tạo đúng part 3/4

    try {
      setLoading(true);

      // ✅ vẫn gọi route part3 để khỏi phải tạo route mới
      const res = await API.post("/api/import/part3", form);

      toast.success(`Import Excel thành công ${res.data.count ?? 0} câu!`, {
        icon: false,
      });

      await fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Import Excel thất bại!", {
        icon: false,
      });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // =======================
  // IMPORT ZIP (AUTO) — giống Part2
  // POST /api/import/part3-zip (multipart: zip + examId + partNumber)
  // =======================
  const handleZipSelected = async (e) => {
    if (!exam?._id) return toast.error("Thiếu exam!", { icon: false });

    const file = e.target.files?.[0];
    if (!file) return;

    setZipFile(file);

    const form = new FormData();
    form.append("zip", file); // upload.single("zip")
    form.append("examId", exam._id);
    form.append("partNumber", String(PART)); // ✅ thêm để BE biết part 3/4

    try {
      setLoading(true);

      // ✅ vẫn gọi route part3-zip để khỏi phải tạo route mới
      const res = await API.post("/api/import/part3-zip", form);

      toast.success(`Import ZIP thành công: ${res.data.count ?? 0} audio!`, {
        icon: false,
      });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Import ZIP thất bại!", {
        icon: false,
      });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // =======================================
  // UPLOAD AUDIO (MANUAL)
  // =======================================
  const uploadAudio = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      const form = new FormData();
      form.append("file", f);

      const res = await API.post("/api/upload/audio", form);

      setNewGroup((prev) => ({ ...prev, audioUrl: res.data.url }));
      toast.success("Đã upload audio!", { icon: false });
    } catch (err) {
      console.error(err);
      toast.error("Upload audio thất bại!", { icon: false });
    } finally {
      e.target.value = "";
    }
  };

  // =======================================
  // SAVE NEW GROUP (MANUAL)
  // =======================================
  const saveGroup = async () => {
    if (!newGroup.audioUrl) return toast.error("Thiếu audio!", { icon: false });

    for (let i = 0; i < 3; i++) {
      const q = newGroup.questions[i];
      if (!q.questionText.trim())
        return toast.error(`Câu ${i + 1} thiếu nội dung`, { icon: false });
      if (q.options.some((op) => !op.trim()))
        return toast.error(`Câu ${i + 1} thiếu đáp án`, { icon: false });
      if (q.answer === -1)
        return toast.error(`Câu ${i + 1} chưa chọn đáp án`, { icon: false });
    }

    try {
      setLoading(true);

      await API.post("/api/questions/part3/manual", {
        examId: exam._id,
        partNumber: PART, // ✅ để BE tạo đúng part 3/4
        audioUrl: newGroup.audioUrl,
        questions: newGroup.questions,
      });

      toast.success("Đã thêm nhóm!", { icon: false });

      setNewGroup({
        audioUrl: "",
        questions: [
          { questionText: "", options: ["", "", "", ""], answer: -1 },
          { questionText: "", options: ["", "", "", ""], answer: -1 },
          { questionText: "", options: ["", "", "", ""], answer: -1 },
        ],
      });

      await fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo nhóm!", { icon: false });
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // DELETE GROUP (groupKey)
  // =======================================
  const deleteGroup = async (key) => {
    if (!window.confirm("Xoá toàn bộ nhóm này?")) return;

    try {
      setLoading(true);
      await API.delete(`/api/questions/group/${key}`);
      toast.success("Đã xoá nhóm!", { icon: false });
      await fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error("Không xoá được nhóm!", { icon: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="part3-container">
      {loading && (
        <div className="part3-loading-overlay">
          <div className="part3-spinner"></div>
        </div>
      )}

      <h2 className="part3-title">
        TOEIC Part {PART} — {partLabel} (3 câu)
      </h2>

      {/* IMPORT EXCEL + ZIP (GIỐNG PART2) */}
      <div className="import-box">
        {/* EXCEL */}
        <input
          type="file"
          id="excelInputPart3"
          className="hidden"
          accept=".xlsx"
          onChange={handleExcelSelected}
        />
        <button
          className="btn-import"
          onClick={() => document.getElementById("excelInputPart3").click()}
          disabled={loading}
        >
          <FileSpreadsheet size={16} style={{ marginRight: 6 }} />
          Import Excel
        </button>

        {/* ZIP */}
        <input
          type="file"
          id="zipInputPart3"
          className="hidden"
          accept=".zip"
          onChange={handleZipSelected}
        />
        <button
          className="btn-import"
          onClick={() => document.getElementById("zipInputPart3").click()}
          disabled={loading}
        >
          📦 Import ZIP
        </button>
      </div>

      <hr />

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
                  arr[i] = { ...arr[i], questionText: e.target.value };
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
                        const opts = [...arr[i].options];
                        opts[idx] = e.target.value;
                        arr[i] = { ...arr[i], options: opts };
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
                          arr[i] = { ...arr[i], answer: idx };
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
        <button className="part3-btn-save" onClick={saveGroup} disabled={loading}>
          ➕ Lưu nhóm
        </button>
      </div>

      <hr />

      {/* LIST GROUP */}
      <div className="part3-group-list">
        {groups.map((g) => (
          <div key={g.groupKey} className="part3-group-item">
            <button
              className="part3-delete-group-btn"
              onClick={() => deleteGroup(g.groupKey)}
              disabled={loading}
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
                      <input type="radio" readOnly checked={q.answer === idx} />
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

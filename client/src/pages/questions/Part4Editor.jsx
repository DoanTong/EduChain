import React, { useEffect, useState } from "react";
import API from "../../api/http";
import { toast } from "react-toastify";
import { PlusCircle, XCircle, Pencil } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function Part3Editor({ exam, examId }) {
  const [groups, setGroups] = useState([]); // mỗi nhóm chứa nhiều câu hỏi
  const [audioUrl, setAudioUrl] = useState("");
  const [script, setScript] = useState("");
  const [groupKey, setGroupKey] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    API.get(`/api/questions/${examId}`).then((res) => {
      const data = res.data?.data || [];
      const byGroup = {};

      data.forEach((q) => {
        if (!byGroup[q.groupKey]) byGroup[q.groupKey] = { audioUrl: q.audioUrl, script: q.script, items: [] };
        byGroup[q.groupKey].items.push(q);
      });

      setGroups(Object.entries(byGroup).map(([k, v]) => ({ groupKey: k, ...v })));
    });
  }, [examId]);

  const uploadAudio = async (e) => {
    const file = e.target.files[0];
    const form = new FormData();
    form.append("file", file);

    const res = await API.post("/api/upload/audio", form);
    setAudioUrl(res.data.url);
  };

  const addGroup = () => {
    const newKey = uuidv4();
    setGroupKey(newKey);
    setAudioUrl("");
    setScript("");
    setQuestions([]);
    toast.info("Đang tạo group mới (Part 3)");
  };

  const saveGroup = async () => {
    if (!audioUrl) return toast.warn("Cần upload file audio");
    if (questions.length === 0) return toast.warn("Cần ít nhất 1 câu hỏi");

    try {
      for (let q of questions) {
        await API.post(`/api/questions/${examId}`, {
          ...q,
          audioUrl,
          script,
          groupKey,
          partNumber: exam.partNumber,
          type: "P4",
        });
      }

      toast.success("Đã lưu nhóm câu hỏi!");

      window.location.reload();
    } catch (err) {
      toast.error("Lưu thất bại");
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        answer: 0,
      },
    ]);
  };

  return (
    <div className="qe-layout">
      <div className="qe-card qe-form">
        <h3>Tạo nhóm câu hỏi Part 3 (Hội thoại)</h3>

        <label>Audio</label>
        <input type="file" accept="audio/*" onChange={uploadAudio} />
        {audioUrl && <audio controls src={audioUrl} />}

        <label>Transcript (tùy chọn)</label>
        <textarea
          className="qe-input"
          value={script}
          onChange={(e) => setScript(e.target.value)}
        />

        <button onClick={addQuestion} className="qe-btn-primary">
          Thêm 1 câu hỏi
        </button>

        {questions.map((q, idx) => (
          <div key={idx} className="qe-subcard">
            <h4>Câu hỏi {idx + 1}</h4>

            <input
              className="qe-input"
              placeholder="Nhập câu hỏi"
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
        <h3>Các nhóm đã tạo ({groups.length})</h3>

        {groups.map((g, idx) => (
          <div key={g.groupKey} className="qe-item">
            <h4>Nhóm {idx + 1}</h4>
            <audio controls src={g.audioUrl}></audio>

            <ul>
              {g.items.map((q, i) => (
                <li key={q._id}>
                  Câu {i + 1}: {q.question}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Part3Editor;

import React, { useEffect, useState } from "react";
import API from "../../../../api/http.js";
import { PlusCircle, Trash2, Edit2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import "./SessionTab.css";

function SessionTab({ exams }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    parts: [],
  });

  // Reset form
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      status: "draft",
      parts: [],
    });
    setEditingId(null);
  };

  // Fetch list
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/exam-sessions");
      setSessions(res.data?.data || []);
    } catch {
      toast.error("Lỗi tải danh sách kỳ thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle change input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add part
  const addPart = () => {
    if (!exams || exams.length === 0) {
      return toast.warn("Chưa có bài thi nào để ghép");
    }
    setForm((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          exam: exams[0]._id,
          label: `Part ${prev.parts.length + 1}`,
          order: prev.parts.length,
          weight: 1,
          durationMinutes: 0,
        },
      ],
    }));
  };

  // Update part
  const updatePart = (index, field, value) => {
    setForm((prev) => {
      const parts = [...prev.parts];
      parts[index] = { ...parts[index], [field]: value };
      return { ...prev, parts };
    });
  };

  // Remove part
  const removePart = (index) => {
    setForm((prev) => {
      const parts = prev.parts.filter((_, i) => i !== index);
      return { ...prev, parts };
    });
  };

  // 🔥 Gửi thông báo thân thiện tùy trạng thái
  const sendFriendlyNotification = async (sessionId, status, title) => {
    let notifyTitle = "";
    let notifyMessage = "";

    if (status === "practice") {
      notifyTitle = "Bài luyện tập mới!";
      notifyMessage =
        "EduChain vừa thêm một bài luyện tập mới rồi đó! Mau vào làm thử nha 💪🔥";
    }

    if (status === "published") {
      notifyTitle = "Kỳ thi chính thức đã mở!";
      notifyMessage = `Kỳ thi chính thức "${title}" đã được công bố! Chuẩn bị tinh thần và chiến thôi ⚡🔥`;
    }

    if (!notifyTitle) return;

    try {
      await API.post("/api/notifications/broadcast", {
        title: notifyTitle,
        message: notifyMessage,
        sessionId,
        type: "exam-session",
      });
      toast.success("📢 Đã gửi thông báo đến người dùng!");
    } catch (e) {
      console.error("Lỗi broadcast:", e);
      toast.error("Không gửi được thông báo!");
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.warn("Vui lòng nhập tên kỳ thi");
    if (!form.parts.length) return toast.warn("Kỳ thi phải có ít nhất 1 part");

    try {
      setLoading(true);

      const payload = {
        ...form,
        parts: form.parts.map((p, idx) => ({
          exam: p.exam,
          label: p.label || `Part ${idx + 1}`,
          order: p.order ?? idx,
          weight: Number(p.weight) || 1,
          durationMinutes: Number(p.durationMinutes) || 0,
        })),
      };

      // Lấy session cũ (để check thay đổi status)
      const oldSession = editingId
        ? sessions.find((x) => x._id === editingId)
        : null;

      let res;

      if (editingId) {
        res = await API.put(`/api/exam-sessions/${editingId}`, payload);
        toast.success("Cập nhật kỳ thi thành công");
      } else {
        res = await API.post("/api/exam-sessions", payload);
        toast.success("Tạo kỳ thi thành công");
      }

      const newId = editingId || res.data?.data?._id;
      const prevStatus = oldSession?.status;
      const newStatus = form.status;

      // 🔥 Logic gửi thông báo
      const shouldNotify =
        !editingId || !prevStatus || prevStatus !== newStatus;

      if (shouldNotify) {
        await sendFriendlyNotification(newId, newStatus, form.title);
      }

      resetForm();
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error("Lưu kỳ thi thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (session) => {
    setEditingId(session._id);
    setForm({
      title: session.title,
      description: session.description || "",
      status: session.status || "draft",
      parts:
        session.parts?.map((p) => ({
          exam: p.exam?._id || p.exam,
          label: p.label,
          order: p.order,
          weight: p.weight,
          durationMinutes: p.durationMinutes,
        })) || [],
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá kỳ thi này?")) return;
    try {
      setLoading(true);
      await API.delete(`/api/exam-sessions/${id}`);
      toast.success("Đã xoá kỳ thi");
      if (editingId === id) resetForm();
      fetchSessions();
    } catch {
      toast.error("Xoá kỳ thi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-flex">
      {/* DANH SÁCH KỲ THI */}
      <div className="adm-panel">
        <div className="adm-panel-header">
          <h2 className="adm-panel-title">Danh sách kỳ thi</h2>
          <button className="adm-btn-secondary" onClick={fetchSessions}>
            Làm mới
          </button>
        </div>

        {loading && (
          <div className="adm-loading">
            <Loader2 className="spin" /> Đang tải...
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <p className="adm-empty">Chưa có kỳ thi nào</p>
        )}

        <ul className="adm-list">
          {sessions.map((s) => (
            <li key={s._id} className="adm-list-item">
              <div>
                <div className="adm-list-title">
                  {s.title}{" "}
                  <span className={`badge badge-${s.status}`}>
                    {s.status === "practice" && "Luyện tập"}
                    {s.status === "draft" && "Nháp"}
                    {s.status === "published" && "Công bố"}
                  </span>
                </div>
                <div className="adm-list-sub">
                  {s.parts?.length || 0} part • Tổng thời lượng:{" "}
                  {s.totalDuration || 0} phút
                </div>
              </div>
              <div className="adm-list-actions">
                <button
                  className="adm-icon-btn"
                  onClick={() => handleEdit(s)}
                  title="Sửa"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="adm-icon-btn danger"
                  onClick={() => handleDelete(s._id)}
                  title="Xoá"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* FORM CREATE / EDIT */}
      <div className="adm-panel">
        <div className="adm-panel-header">
          <h2 className="adm-panel-title">
            {editingId ? "Chỉnh sửa kỳ thi" : "Tạo kỳ thi mới"}
          </h2>
        </div>

        <div className="adm-form">
          <div className="adm-field">
            <label>Tên kỳ thi</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Full TOEIC Test 01"
            />
          </div>

          <div className="adm-field">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về kỳ thi..."
            />
          </div>

          <div className="adm-field">
            <label>Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="practice">Luyện tập</option>
              <option value="draft">Nháp</option>
              <option value="published">Công bố</option>
            </select>
          </div>

          <div className="adm-field">
            <label>Danh sách Part</label>

            {form.parts.length === 0 && (
              <p className="adm-empty">Chưa có part nào. Thêm part mới.</p>
            )}

            <div className="parts-list">
              {form.parts.map((part, index) => (
                <div key={index} className="part-row">
                  <div className="part-row-header">
                    <span>Part {index + 1}</span>
                    <button
                      className="adm-icon-btn danger"
                      type="button"
                      onClick={() => removePart(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="part-grid">
                    <div>
                      <label>Bài thi (Part)</label>
                      <select
                        value={part.exam}
                        onChange={(e) =>
                          updatePart(index, "exam", e.target.value)
                        }
                      >
                        {exams.map((ex) => (
                          <option key={ex._id} value={ex._id}>
                            {ex.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Nhãn hiển thị</label>
                      <input
                        type="text"
                        value={part.label}
                        onChange={(e) =>
                          updatePart(index, "label", e.target.value)
                        }
                        placeholder="Ví dụ: Part 1 - Listening"
                      />
                    </div>

                    <div>
                      <label>Thứ tự</label>
                      <input
                        type="number"
                        value={part.order}
                        onChange={(e) =>
                          updatePart(index, "order", Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label>Trọng số</label>
                      <input
                        type="number"
                        value={part.weight}
                        onChange={(e) =>
                          updatePart(
                            index,
                            "weight",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Thời lượng (phút)</label>
                      <input
                        type="number"
                        value={part.durationMinutes}
                        onChange={(e) =>
                          updatePart(
                            index,
                            "durationMinutes",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="adm-btn-secondary mt-2"
              onClick={addPart}
            >
              <PlusCircle size={18} className="mr-1" />
              Thêm part
            </button>
          </div>

          <div className="adm-form-actions">
            {editingId && (
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={resetForm}
              >
                Huỷ chỉnh sửa
              </button>
            )}

            <button
              type="button"
              className="adm-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spin mr-1" size={18} /> Đang lưu...
                </>
              ) : editingId ? (
                "Cập nhật kỳ thi"
              ) : (
                "Tạo kỳ thi"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionTab;

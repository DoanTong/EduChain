import express from "express";
import ExamSession from "../models/ExamSession.js";

const router = express.Router();

// 🟢 Lấy danh sách kỳ thi
router.get("/practice/all", async (req, res) => {
  try {
    const list = await ExamSession.find({ status: "practice" })
      .sort({ createdAt: -1 })
      .populate("parts.exam");

    res.json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Load practice sessions failed" });
  }
});
router.get("/", async (req, res) => {
  try {
    const sessions = await ExamSession.find()
      .populate("parts.exam", "title totalQuestions")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách kỳ thi:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const sessions = await ExamSession.find().sort({ createdAt: -1 });
    res.json({ data: sessions });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải exam sessions" });
  }
});
// 🟢 Lấy 1 kỳ thi
router.get("/:id", async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.id).populate(
      "parts.exam",
      "title totalQuestions"
    );

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Exam session not found" });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    console.error("❌ Lỗi lấy kỳ thi:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟢 Tạo kỳ thi mới
router.post("/", async (req, res) => {
  try {
    const { title, description, status, parts } = req.body;

    if (!title || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title và danh sách parts là bắt buộc",
      });
    }

    // Tính tổng thời gian / weight
    const totalDuration = parts.reduce(
      (sum, p) => sum + (Number(p.durationMinutes) || 0),
      0
    );
    const totalWeight = parts.reduce(
      (sum, p) => sum + (Number(p.weight) || 0),
      0
    );

    const session = await ExamSession.create({
      title,
      description,
      status: status || "draft",
      parts: parts.map((p, idx) => ({
        exam: p.exam,
        label: p.label || `Part ${idx + 1}`,
        order: p.order ?? idx,
        weight: Number(p.weight) || 1,
        durationMinutes: Number(p.durationMinutes) || 0,
      })),
      totalDuration,
      totalWeight,
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error("❌ Lỗi tạo kỳ thi:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟢 Cập nhật kỳ thi
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status, parts } = req.body;

    const totalDuration = Array.isArray(parts)
      ? parts.reduce((sum, p) => sum + (Number(p.durationMinutes) || 0), 0)
      : 0;
    const totalWeight = Array.isArray(parts)
      ? parts.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)
      : 0;

    const updated = await ExamSession.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        parts,
        totalDuration,
        totalWeight,
      },
      { new: true }
    ).populate("parts.exam", "title totalQuestions");

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Exam session not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Lỗi cập nhật kỳ thi:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟢 Xoá kỳ thi
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ExamSession.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Exam session not found" });
    }

    res.json({ success: true, message: "Đã xoá kỳ thi" });
  } catch (err) {
    console.error("❌ Lỗi xoá kỳ thi:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export default router;

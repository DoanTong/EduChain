import express from "express";
import Result from "../models/Result.js";
import Exam from "../models/Exam.js";

const router = express.Router();
// GET leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    // 1. Lấy danh sách bài thi official
    const officialExams = await Exam.find({ type: "official" }).select("_id");

    const officialExamIds = officialExams.map(e => e._id);

    // 2. Lọc result thuộc exam official
    const results = await Result.find({
      examId: { $in: officialExamIds }
    })
      .sort({ score: -1 }) // sắp theo điểm cao → thấp
      .limit(20);          // giới hạn top 20

    res.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Lỗi leaderboard:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Lấy danh sách kết quả theo kỳ thi
router.get("/:examId", async (req, res) => {
  try {
    const { examId } = req.params;

    // Lấy toàn bộ kết quả, sắp xếp từ mới nhất → cũ nhất
    const results = await Result.find({ examId }).sort({ createdAt: -1 });

    // Nhóm theo fullName, lấy lần mới nhất
    const unique = {};
    for (const r of results) {
      if (!unique[r.fullName]) {
        unique[r.fullName] = r; // lần mới nhất vì sort() rồi
      }
    }

    res.json({
      success: true,
      data: Object.values(unique), // list kết quả đã lọc
    });
  } catch (err) {
    console.error("❌ GET /results lỗi:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});


// ⭐⭐⭐ THÊM ROUTE POST ĐÂY
router.post("/", async (req, res) => {
  try {
    console.log("📥 Data nhận từ client:", req.body);

    const result = new Result(req.body);
    await result.save();

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("❌ POST /results lỗi:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: err.message,
    });
  }
});


export default router;

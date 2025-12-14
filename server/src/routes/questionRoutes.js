import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

/**
 * ===========================================
 * GET /api/questions/exam/:examId
 * Lấy câu hỏi theo exam, có thể filter theo part
 * ===========================================
 */
router.get("/exam/:examId", async (req, res) => {
  try {
    const filter = { examId: req.params.examId };

    if (req.query.part) {
      filter.partNumber = Number(req.query.part);
    }

    const data = await Question.find(filter);
    res.json({ success: true, data });
  } catch (err) {
    console.error("❌ GET Questions Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ===========================================
 * POST /api/questions/exam/:examId
 * Thêm câu hỏi mới (Part 1,2,4,5,6,7)
 * ===========================================
 */
router.post("/exam/:examId", async (req, res) => {
  try {
    const created = await Question.create({
      examId: req.params.examId,
      ...req.body,
    });

    res.json({ success: true, data: created });
  } catch (err) {
    console.error("❌ Create Question Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ===========================================
 * PUT /api/questions/id/:questionId
 * Cập nhật câu hỏi theo ID
 * ===========================================
 */
router.put("/id/:questionId", async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(
      req.params.questionId,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Update Question Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ===========================================
 * DELETE /api/questions/id/:questionId
 * Xóa 1 câu hỏi theo ID
 * ===========================================
 */
router.delete("/id/:questionId", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.questionId);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Question Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ===========================================
 * DELETE /api/questions/group/:groupKey
 * Xóa toàn bộ nhóm Part 3 theo groupKey
 * ===========================================
 */
router.delete("/group/:groupKey", async (req, res) => {
  try {
    await Question.deleteMany({ groupKey: req.params.groupKey });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Group Error:", err);
    res.status(500).json({ success: false });
  }
});

/**
 * ===========================================
 * POST /api/questions/part3/manual
 * Tạo nhóm Part 3 gồm 3 câu
 * ===========================================
 */
router.post("/part3/manual", async (req, res) => {
  try {
    const { examId, audioUrl, questions } = req.body;

    const groupKey = Date.now().toString();
    const inserted = [];

    for (let i = 0; i < 3; i++) {
      const doc = await Question.create({
        examId,
        partNumber: 3,
        groupKey,
        audioUrls: [audioUrl],
        questionText: questions[i].questionText,
        options: questions[i].options,
        answer: questions[i].answer,
      });

      inserted.push(doc);
    }

    res.json({
      success: true,
      data: {
        groupKey,
        audioUrl,
        questions,
      },
    });
  } catch (err) {
    console.error("❌ Create Part 3 Group Error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;

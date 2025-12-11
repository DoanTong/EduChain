import SessionResult from "../models/SessionResult.js";
import ExamSession from "../models/ExamSession.js";
import Question from "../models/Question.js";
import Certificate from "../models/Certificate.js";

// =====================================================
// POST /api/session-results
// Lưu kết quả kỳ thi (single exam hoặc official session)
// =====================================================
export const saveSessionResult = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      sessionId,
      totalCorrect,
      totalQuestions,
      durationSeconds,
      parts,
      answers
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId is required"
      });
    }

    // Lấy session để biết status → suy ra mode
    const sessionDoc = await ExamSession.findById(sessionId);

    let mode = "practice"; // default
    if (sessionDoc) {
      if (sessionDoc.status === "published") mode = "published";
      else if (sessionDoc.status === "practice") mode = "practice";
    } else {
      console.log("⚠ sessionId không phải ExamSession → MODE = practice");
    }

    // Convert parts
    const partDocs = (parts || []).map((p) => ({
      exam: p.examId || null,
      label: p.label || "",
      correct: p.correct ?? 0,
      total: p.total ?? 0,
    }));

    const accuracy =
      totalQuestions > 0
        ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1))
        : 0;

    const payload = {
      user: userId,
      session: sessionId,
      mode, // 🔥 Lưu mode
      totalCorrect: totalCorrect || 0,
      totalQuestions: totalQuestions || 0,
      accuracy,
      durationSeconds: durationSeconds || 0,
      parts: partDocs,
      answers: answers || [],
    };

    const saved = await SessionResult.findOneAndUpdate(
      { user: userId, session: sessionId },
      payload,
      { new: true, upsert: true }
    )
      .populate("session", "title status totalDuration")
      .populate("parts.exam", "title");

    res.json({ success: true, data: saved });

  } catch (err) {
    console.error("❌ saveSessionResult ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Save session result failed",
    });
  }
};


// =====================================================
// GET /api/session-results/my
// Lịch sử những session user đã làm
// =====================================================
export const getMySessionResults = async (req, res) => {
  try {
    const userId = req.user._id;

    const list = await SessionResult.find({ user: userId })
      .populate("session", "title status totalDuration createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: list });

  } catch (err) {
    console.error("❌ getMySessionResults ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Load session results failed",
    });
  }
};


// =====================================================
// GET /api/session-results/:sessionId/review
// Xem lại bài làm → FE yêu cầu data theo từng Part
// =====================================================
export const getReviewBySession = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    const result = await SessionResult.findOne({
      session: sessionId,
      user: req.user._id
    });

    if (!result) {
      return res.status(404).json({
        message: "Không tìm thấy kết quả bài làm."
      });
    }

    if (!result.answers || result.answers.length === 0) {
      return res.status(400).json({
        message: "Không có dữ liệu chi tiết câu hỏi trong sessionResult."
      });
    }

    // Lấy toàn bộ câu hỏi đã trả lời
    const questions = await Question.find({
      _id: { $in: result.answers.map(a => a.questionId) }
    });

    const mapped = {};

    questions.forEach((q) => {
      const part = q.partNumber || 1;
      const ans = result.answers.find(
        a => String(a.questionId) === String(q._id)
      );

      if (!mapped[part]) {
        mapped[part] = {
          correct: 0,
          total: 0,
          questions: [],
          answers: []
        };
      }

      mapped[part].total++;
      mapped[part].questions.push({ answer: q.answer });
      mapped[part].answers.push(ans?.answerIndex);

      if (ans?.answerIndex === q.answer) mapped[part].correct++;
    });

    res.json({
      data: {
        mode: result.mode,              // 🔥 FIXED: dùng mode từ DB
        results: mapped,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions
      }
    });

  } catch (err) {
    console.error("❌ Review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const getPublishedResults = async (req, res) => {
  try {
    const list = await SessionResult.find({ mode: "published" })
      .populate("user", "name email")
      .populate("session", "title status")
      .populate("parts.exam", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: list });

  } catch (err) {
    console.error("❌ getPublishedResults ERROR:", err);
    res.status(500).json({ success: false, message: "Load results failed" });
  }
};
// =====================================================
// GET /api/session-results/published/eligible
// Lọc user có điểm > 50% để cấp chứng chỉ
// =====================================================
export const getEligibleForCertificate = async (req, res) => {
  try {

    let list = await SessionResult.find({
      mode: "published",
      accuracy: { $gte: 50 }
    })
      .populate("user", "name email wallet")
      .populate("session", "title")
      .lean();

    console.log("📌 Found results:", list.length);

    const filtered = [];

    for (const r of list) {
      if (!r.user?._id || !r.session?._id) {
        continue;
      }

      const exists = await Certificate.findOne({
        user: r.user._id,
        examId: r.session._id    
      });
      if (!exists) filtered.push(r);
    }

    return res.json({ success: true, data: filtered });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Load eligible users failed"
    });
  }
};

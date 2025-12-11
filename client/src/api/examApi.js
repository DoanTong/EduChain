const express = require("express");
const router = express.Router();

// Tạm tạo MOCK DATA để frontend chạy được
const mockExams = [
  {
    _id: "exam1",
    title: "Kỳ thi Blockchain căn bản",
    totalQuestions: 20,
    passScore: 15
  },
  {
    _id: "exam2",
    title: "Kỳ thi Lập trình Web",
    totalQuestions: 25,
    passScore: 18
  },
  {
    _id: "exam3",
    title: "Kỳ thi An toàn thông tin",
    totalQuestions: 30,
    passScore: 20
  }
];

// GET /api/exams
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: mockExams,
  });
});

module.exports = router;

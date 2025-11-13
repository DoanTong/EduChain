import Exam from "../models/Exam.js";

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách kỳ thi:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// (Tuỳ chọn) tạo kỳ thi mới
export const createExam = async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

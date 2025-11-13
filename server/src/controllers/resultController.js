import Result from "../models/Result.js";

export const getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const results = await Result.find({ examId });
    res.json(results);
  } catch (err) {
    console.error("❌ Lỗi lấy kết quả:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// (Tuỳ chọn) thêm kết quả mới
export const createResult = async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// import express from "express";
// import Exam from "../models/Exam.js";
// import multer from "multer";
// import XLSX from "xlsx";
// import jwt from "jsonwebtoken";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
// /**
//  * GET /api/exams
//  * Lấy danh sách kỳ thi
//  */
// router.get("/", async (req, res) => {
//   try {
//     const exams = await Exam.find();

//     res.json({
//       success: true,
//       data: exams,
//     });
//   } catch (err) {
//     console.error("❌ Lỗi lấy danh sách exams:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// //🔹 LẤY THÔNG TIN 1 KỲ THI
// router.get("/:id", async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id);

//     if (!exam) {
//       return res.status(404).json({ success: false, message: "Exam not found" });
//     }

//     res.json({ success: true, data: exam });
//   } catch (err) {
//     console.error("❌ Lỗi lấy exam:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /api/exams
//  * Tạo kỳ thi mới (test thôi)
//  */
// router.post("/", async (req, res) => {
//   try {
//     const exam = await Exam.create(req.body);
//     res.json({ success: true, message: "Tạo kỳ thi thành công!", data: exam });
//   } catch (err) {
//     console.error("❌ Lỗi tạo exam:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// router.delete("/:id", async (req, res) => {
//   try {
//     const exam = await Exam.findByIdAndDelete(req.params.id);
//     if (!exam) return res.status(404).json({ success: false, message: "Not found" });

//     res.json({ success: true, message: "Exam deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
// // 🔹 LẤY DANH SÁCH CÂU HỎI
// router.get("/:id/questions", async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.id);

//     if (!exam) {
//       return res.status(404).json({ success: false, message: "Exam not found" });
//     }

//     res.json({
//       success: true,
//       data: exam,   // ⭐ trả về full exam (title + questions)
//     });

//   } catch (err) {
//     console.error("❌ Lỗi tải câu hỏi:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// // 🔹 THÊM CÂU HỎI
// router.post("/:id/questions", async (req, res) => {
//   try {
//     const { question, options, answer } = req.body;

//     const exam = await Exam.findById(req.params.id);
//     exam.questions.push({ question, options, answer });
//     exam.totalQuestions = exam.questions.length;

//     await exam.save();

//     res.json({ data: exam.questions[exam.questions.length - 1] });
//   } catch (err) {
//     res.status(500).json({ error: "Lỗi thêm câu hỏi" });
//   }
// });
// // 🔹UPDATE CÂU HỎI
// router.put("/:examId/questions/:questionId", async (req, res) => {
//   try {
//     const { examId, questionId } = req.params;
//     const { question, options, answer } = req.body;

//     const exam = await Exam.findById(examId);
//     if (!exam) {
//       return res.status(404).json({ success: false, message: "Exam not found" });
//     }

//     const index = exam.questions.findIndex(
//       (q) => q._id.toString() === questionId
//     );

//     if (index === -1) {
//       return res.status(404).json({ success: false, message: "Question not found" });
//     }

//     // Cập nhật
//     exam.questions[index].question = question;
//     exam.questions[index].options = options;
//     exam.questions[index].answer = answer;

//     await exam.save();

//     res.json({
//       success: true,
//       data: exam.questions[index]
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Update failed" });
//   }
// });

// // =========================
// // 📌 IMPORT EXCEL
// // =========================
// router.post("/:id/import-excel", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "Không có file upload" });

//     // Đọc file Excel
//     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet);

//     // Tìm exam
//     const exam = await Exam.findById(req.params.id);
//     if (!exam) return res.status(404).json({ error: "Exam không tồn tại" });

//     // Convert mỗi dòng → 1 câu hỏi
//     rows.forEach((r) => {
//       exam.questions.push({
//         question: r.question,
//         options: [r.option1, r.option2, r.option3, r.option4],
//         answer: Number(r.answer),
//       });
//     });
//     exam.totalQuestions = exam.questions.length;
//     await exam.save();

//     res.json({ success: true, added: rows.length });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Import Excel thất bại" });
//   }
// });
// // =========================
// // 📌 IMPORT JSON
// // =========================
// router.post("/:id/import-json", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { questions } = req.body;

//     if (!Array.isArray(questions)) {
//       return res.status(400).json({
//         success: false,
//         message: "Dữ liệu JSON không hợp lệ",
//       });
//     }

//     const exam = await Exam.findById(id);
//     if (!exam) {
//       return res.status(404).json({
//         success: false,
//         message: "Exam không tồn tại",
//       });
//     }

//     // append câu hỏi vào exam
//     questions.forEach((q) => {
//       exam.questions.push({
//         question: q.question,
//         options: q.options,
//         answer: q.answer,
//       });
//     }); 
//     exam.totalQuestions = exam.questions.length;
//     await exam.save();

//     res.json({
//       success: true,
//       added: questions.length,
//       data: exam.questions,
//     });
//   } catch (err) {
//     console.error("❌ Lỗi import JSON:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // 🔹 XOÁ CÂU HỎI
// router.delete("/:examId/questions/:questionId", async (req, res) => {
//   try {
//     const exam = await Exam.findById(req.params.examId);
//     exam.questions = exam.questions.filter(
//       (q) => q._id.toString() !== req.params.questionId
//     );

//     exam.totalQuestions = exam.questions.length;
//     await exam.save();

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Lỗi xoá câu hỏi" });
//   }
// });

// export default router;
// routes/examRoutes.js
// routes/examRoutes.js
import express from "express";
import Exam from "../models/Exam.js";
import multer from "multer";
import XLSX from "xlsx";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/exams
 * Lấy danh sách kỳ thi
 */
router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json({ success: true, data: exams });
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách exams:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/exams/:id
 * Lấy thông tin 1 kỳ thi
 */
router.get("/:id", async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam)
      return res.status(404).json({ success: false, message: "Exam not found" });

    res.json({ success: true, data: exam });
  } catch (err) {
    console.error("❌ Lỗi lấy exam:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/exams
 * Tạo kỳ thi mới
 */
router.post("/", async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.json({ success: true, message: "Tạo kỳ thi thành công!", data: exam });
  } catch (err) {
    console.error("❌ Lỗi tạo exam:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * DELETE /api/exams/:id
 * Xóa kỳ thi
 */
router.delete("/:id", async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/exams/:id/import-excel
 * Import danh sách câu hỏi từ Excel
 */
router.post("/:id/import-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Không có file upload" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam không tồn tại" });

    rows.forEach((r) => {
      exam.questions.push({
        question: r.question,
        options: [r.option1, r.option2, r.option3, r.option4],
        answer: Number(r.answer),
      });
    });

    exam.totalQuestions = exam.questions.length;
    await exam.save();

    res.json({ success: true, added: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import Excel thất bại" });
  }
});

/**
 * POST /api/exams/:id/import-json
 * Import câu hỏi từ JSON
 */
router.post("/:id/import-json", async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions))
      return res.status(400).json({ success: false, message: "JSON không hợp lệ" });

    const exam = await Exam.findById(req.params.id);
    if (!exam)
      return res.status(404).json({ success: false, message: "Exam không tồn tại" });

    questions.forEach((q) => {
      exam.questions.push({
        question: q.question,
        options: q.options,
        answer: q.answer,
      });
    });

    exam.totalQuestions = exam.questions.length;
    await exam.save();

    res.json({ success: true, added: questions.length });
  } catch (err) {
    console.error("❌ Lỗi import JSON:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

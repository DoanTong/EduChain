import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import Question from "../models/Question.js";

const router = express.Router();

// dùng memory buffer vì Excel không phải lưu file
const upload = multer({ storage: multer.memoryStorage() });

router.post("/part1", upload.single("file"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const host = `${req.protocol}://${req.get("host")}`;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let row of sheet) {
      const q = await Question.create({
        examId,
        partNumber: 1,
        imageUrl: `${host}/uploads/${row.image}`,
        audioUrls: [
          `${host}/uploads/${row.audioA}`,
          `${host}/uploads/${row.audioB}`,
          `${host}/uploads/${row.audioC}`,
          `${host}/uploads/${row.audioD}`,
        ],
        answer: "ABCD".indexOf(row.answer),
      });

      inserted.push(q);
    }

    res.json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Import Part 1 thất bại!" });
  }
});
router.post("/part2", upload.single("file"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const host = `${req.protocol}://${req.get("host")}`;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let row of sheet) {
      if (!row.audio || !row.answer) continue;

      const file = row.audio.trim();
      const letter = row.answer.toUpperCase();

      const index = { A: 0, B: 1, C: 2 }[letter];
      if (index === undefined) continue;

      const q = await Question.create({
        examId,
        partNumber: 2,
        audioUrls: [`${host}/uploads/audio/${file}`],  // 🔥 y hệt Part 1
        options: [],
        answer: index,
      });

      inserted.push(q);
    }

    res.json({ success: true, data: inserted, count: inserted.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Import Part 2 thất bại!" });
  }
});
router.post("/part3", upload.single("file"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const host = `${req.protocol}://${req.get("host")}`;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i];

      if (!row || !row.audio || !row.question || !row.answer) continue;

      const audioName = String(row.audio).trim();
      const groupKey =
        row.groupKey && String(row.groupKey).trim() !== ""
          ? String(row.groupKey).trim()
          : `P3-XLSX-${examId}-${i}`;

      const A = row.A ?? row.a ?? "";
      const B = row.B ?? row.b ?? "";
      const C = row.C ?? row.c ?? "";
      const D = row.D ?? row.d ?? "";

      const opts = [A, B, C, D].map((x) => String(x || "").trim());

      const ansLetter = String(row.answer).trim().toUpperCase();
      const ansIndex = "ABCD".indexOf(ansLetter);
      if (ansIndex === -1) {
        throw new Error(`Dòng ${i + 1}: đáp án '${row.answer}' không hợp lệ`);
      }

      const q = await Question.create({
        examId,
        partNumber: 3,
        groupKey,
        audioUrls: [`${host}/uploads/audio/${audioName}`],
        questionText: String(row.question).trim(),
        options: opts,
        answer: ansIndex,
      });

      inserted.push(q);
    }

    res.json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    console.error("❌ Import Part 3 Excel lỗi:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Import Part 3 thất bại!",
    });
  }
});


export default router;

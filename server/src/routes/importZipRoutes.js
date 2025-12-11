import express from "express";
import multer from "multer";
import unzipper from "unzipper";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import Question from "../models/Question.js";

const router = express.Router();
const upload = multer({ dest: "temp_zip/" });


// ===============================
// SAFE CLEAN (không bao giờ lỗi)
// ===============================
const clean = (s) => {
  if (!s) return "";               // không bao giờ trả null
  s = String(s).trim();            // ép thành string
  return s.replace(/^(images|audio)[\\/]/, "").trim();
};



// ===============================
// 🔥 TÌM FILE ĐỆ QUY
// ===============================
function findFileRecursive(dir, ext) {
  const items = fs.readdirSync(dir);

  for (let item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && item.toLowerCase().endsWith(ext.toLowerCase())) {
      return fullPath;
    }

    if (stat.isDirectory()) {
      const found = findFileRecursive(fullPath, ext);
      if (found) return found;
    }
  }
  return null;
}


// ===============================
// 🔥 TÌM FOLDER ĐỆ QUY
// ===============================
function findFolderRecursive(dir, folderName) {
  const items = fs.readdirSync(dir);

  for (let item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory() && item.toLowerCase() === folderName.toLowerCase()) {
      return full;
    }

    if (stat.isDirectory()) {
      const found = findFolderRecursive(full, folderName);
      if (found) return found;
    }
  }
  return null;
}


// ===============================
// 🔥 COPY FILE AN TOÀN
// ===============================
function copyAllFiles(srcFolder, destFolder) {
  const saved = {};

  if (!fs.existsSync(srcFolder)) return saved;

  const finalDest = path.join("uploads", destFolder);
  if (!fs.existsSync(finalDest)) {
    fs.mkdirSync(finalDest, { recursive: true });
  }

  const files = fs.readdirSync(srcFolder);

  for (let file of files) {

    // Skip file rác
    if (!file || typeof file !== "string") continue;
    if (file.startsWith(".")) continue;
    if (["Thumbs.db", "desktop.ini"].includes(file)) continue;

    const src = path.join(srcFolder, file);
    const dest = path.join(finalDest, file);

    fs.copyFileSync(src, dest);
    saved[file] = `${dest}`;
  }

  return saved;
}


// ===============================
// 🔥 ROUTE IMPORT ZIP
// ===============================
router.post("/part1-zip", upload.single("zip"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const zipPath = req.file.path;
    const extractDir = `temp_extract_${Date.now()}`;
    fs.mkdirSync(extractDir);

    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const host = `${req.protocol}://${req.get("host")}`;

    const imagesDir = findFolderRecursive(extractDir, "images");
    const audioDir = findFolderRecursive(extractDir, "audio");

    if (!imagesDir) throw new Error("❌ Không tìm thấy folder images/ trong ZIP");
    if (!audioDir) throw new Error("❌ Không tìm thấy folder audio/ trong ZIP");

    const images = copyAllFiles(imagesDir, "images");
    const audio = copyAllFiles(audioDir, "audio");

    const excelPath = findFileRecursive(extractDir, ".xlsx");
    if (!excelPath) throw new Error("❌ Không tìm thấy file Excel trong ZIP");

    const workbook = XLSX.readFile(excelPath);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i];

      // console.log(`\n---- XỬ LÝ DÒNG ${i + 1} ----`);
      // console.log("ROW:", row);

      // bỏ dòng trống
      if (!row || Object.values(row).every(v => !v || String(v).trim() === "")) {
        console.log("⏭ Bỏ dòng trống");
        continue;
      }

      if (
  !row.image ||
  !row.audioA ||
  !row.audioB ||
  !row.audioC ||
  !row.audioD ||
  typeof row.image !== "string"
) {
  continue;  // <<< KHÔNG THROW ERROR
}


      if (!row.audioA) throw new Error(`❌ Dòng ${i+1}: Thiếu audioA`);
      if (!row.audioB) throw new Error(`❌ Dòng ${i+1}: Thiếu audioB`);
      if (!row.audioC) throw new Error(`❌ Dòng ${i+1}: Thiếu audioC`);
      if (!row.audioD) throw new Error(`❌ Dòng ${i+1}: Thiếu audioD`);

      const imgName = clean(row.image);
      const audioA = clean(row.audioA);
      const audioB = clean(row.audioB);
      const audioC = clean(row.audioC);
      const audioD = clean(row.audioD);
      const q = await Question.create({
        examId,
        partNumber: 1,
        imageUrl: `${host}/${images[imgName]}`,
        audioUrls: [
          `${host}/${audio[audioA]}`,
          `${host}/${audio[audioB]}`,
          `${host}/${audio[audioC]}`,
          `${host}/${audio[audioD]}`,
        ],
        answer: "ABCD".indexOf(row.answer),
      });

      inserted.push(q);
    }

    res.json({ success: true, count: inserted.length, data: inserted });
    // ====== DỌN RÁC SAU IMPORT ======
    try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}

  } catch (err) {
    console.error("❌ Import ZIP lỗi:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/part2-zip", upload.single("zip"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const zipPath = req.file.path;
    const extractDir = `temp_extract_part2_${Date.now()}`;
    fs.mkdirSync(extractDir);

    // Giải nén ZIP
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();
    
    const host = `${req.protocol}://${req.get("host")}`;

    // Tìm folder audio trong ZIP
    const audioDir = findFolderRecursive(extractDir, "audio");
    if (!audioDir) throw new Error("❌ Không tìm thấy folder audio/ trong ZIP");

    // COPY file audio sang /uploads/audio
    const audioMap = copyAllFiles(audioDir, "audio");

    // Tìm file Excel trong ZIP
    const excelPath = findFileRecursive(extractDir, ".xlsx");
    if (!excelPath) throw new Error("❌ Không tìm thấy file Excel trong ZIP");

    // Đọc Excel
    const workbook = XLSX.readFile(excelPath);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i];

      // Bỏ dòng trống
      if (!row || !row.audio || !row.answer) continue;

      const audioName = clean(row.audio);
      const letter = row.answer.toUpperCase();
      const index = { A: 0, B: 1, C: 2 }[letter];

      if (index === undefined)
        throw new Error(`❌ Dòng ${i + 1}: đáp án '${row.answer}' không hợp lệ`);

      if (!audioMap[audioName])
        throw new Error(`❌ Audio '${audioName}' không tồn tại trong ZIP`);

      const q = await Question.create({
        examId,
        partNumber: 2,
        audioUrls: [`${host}/${audioMap[audioName]}`],
        options: [],
        answer: index,
      });

      inserted.push(q);
    }

    res.json({
      success: true,
      count: inserted.length,
      data: inserted
    });

    // Xóa file tạm
    try { fs.rmSync(extractDir, { recursive: true, force: true }); } catch {}
    try { fs.rmSync(zipPath, { force: true }); } catch {}

  } catch (err) {
    console.log("❌ Import ZIP Part 2 lỗi:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/part3-zip", upload.single("zip"), async (req, res) => {
  try {
    const examId = req.body.examId;
    const zipPath = req.file.path;
    const extractDir = `temp_extract_part3_${Date.now()}`;
    fs.mkdirSync(extractDir);

    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    const host = `${req.protocol}://${req.get("host")}`;

    // Tìm folder audio trong ZIP
    const audioDir = findFolderRecursive(extractDir, "audio");
    if (!audioDir) throw new Error("❌ Không tìm thấy folder audio/ trong ZIP");

    // Copy audio sang uploads/audio
    const audioMap = copyAllFiles(audioDir, "audio"); // { "conv1.m4a": "uploads/audio/conv1.m4a", ... }

    // Tìm file Excel
    const excelPath = findFileRecursive(extractDir, ".xlsx");
    if (!excelPath) throw new Error("❌ Không tìm thấy file Excel trong ZIP");

    const workbook = XLSX.readFile(excelPath);
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets["Sheet1"]);

    const inserted = [];

    for (let i = 0; i < sheet.length; i++) {
      const row = sheet[i];

      if (!row || !row.audio || !row.question || !row.answer) continue;

      const audioName = clean(row.audio); // bỏ 'audio/' nếu có
      const groupKey =
        row.groupKey && String(row.groupKey).trim() !== ""
          ? String(row.groupKey).trim()
          : `P3-ZIP-${examId}-${i}`;

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

      if (!audioMap[audioName]) {
        throw new Error(
          `Dòng ${i + 1}: audio '${audioName}' không tồn tại trong folder audio/`
        );
      }

      const q = await Question.create({
        examId,
        partNumber: 3,
        groupKey,
        audioUrls: [`${host}/${audioMap[audioName]}`],
        questionText: String(row.question).trim(),
        options: opts,
        answer: ansIndex,
      });

      inserted.push(q);
    }

    res.json({ success: true, count: inserted.length, data: inserted });

    // Dọn rác
    try {
      fs.rmSync(extractDir, { recursive: true, force: true });
    } catch {}
    try {
      fs.rmSync(zipPath, { force: true });
    } catch {}
  } catch (err) {
    console.error("❌ Import ZIP Part 3 lỗi:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
  




export default router;

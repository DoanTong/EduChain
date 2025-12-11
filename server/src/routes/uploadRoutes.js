import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// Folder uploads
const uploadFolder = "uploads/";

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 🟩 FUNCTION TẠO URL FULL (fix hoàn toàn lỗi ảnh/audio)
const makeUrl = (req, filename) => {
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

// IMAGE UPLOAD
router.post("/image", upload.single("file"), (req, res) => {
  const fileUrl = makeUrl(req, req.file.filename);
  res.json({ url: fileUrl });
});

// AUDIO UPLOAD
router.post("/audio", upload.single("file"), (req, res) => {
  const fileUrl = makeUrl(req, req.file.filename);
  res.json({ url: fileUrl });
});

export default router;

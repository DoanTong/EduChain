import express from "express";
import multer from "multer";
import fs from "fs";
import {
  updateName,
  changePassword,
  updateWallet,
  uploadAvatar
} from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { getQuickProfile } from "../controllers/userController.js";
import { getFullProfile } from "../controllers/userController.js";
import User from "../models/User.js";

const router = express.Router();

// Ensure folder exists
const uploadPath = "uploads/avatars";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `avatar_${req.user._id}.${ext}`);
  },
});

const upload = multer({ storage });

router.put("/update", requireAuth, updateName);
router.put("/change-password", requireAuth, changePassword);
router.put("/wallet", requireAuth, updateWallet);

router.post("/avatar", requireAuth, upload.single("avatar"), uploadAvatar);
// 🟢 Lấy danh sách người dùng + lastActive
router.get("/active-list", async (req, res) => {
  try {
    const users = await User.find()
      .select("_id name avatar role lastActive");

    res.json({ data: users });
  } catch (err) {
    console.error("❌ Lỗi active-list:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/:id/quick-profile", getQuickProfile);
router.get("/:id", getFullProfile);



export default router;

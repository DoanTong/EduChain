import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  toggleLockUser,
  resetPassword
} from "../controllers/adminController.js";

import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  getOnlineUsers,
  getSystemStats,
  getScoreChart,
} from "../controllers/adminController.js";
import { getAllExamSessions } from "../controllers/adminController.js";
const router = express.Router();

// Lấy danh sách user
router.get("/users", requireAuth, requireAdmin, getAllUsers);

// Cập nhật quyền
router.put("/users/:id/role", requireAuth, requireAdmin, updateUserRole);

// Xóa user
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);

// Khóa / mở khóa user
router.put("/users/:id/toggle-lock", requireAuth, requireAdmin, toggleLockUser);

// Reset mật khẩu
router.put("/users/:id/reset-password", requireAuth, requireAdmin, resetPassword);

router.get("/online-users", getOnlineUsers);
router.get("/stats", getSystemStats);
router.get("/chart-scores", getScoreChart);
router.get("/examsessions", getAllExamSessions);
export default router;

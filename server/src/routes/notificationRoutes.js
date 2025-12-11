// import express from "express";
// import {
//   broadcastNotification,
//   sendToUser,
//   getMyNotifications,
//   markAllRead,
//   markOneRead,
// } from "../controllers/notificationController.js";
// import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";


// const router = express.Router();

// router.get("/my", requireAuth, getMyNotifications);
// router.put("/mark-all-read", requireAuth, markAllRead);
// router.post("/broadcast", requireAuth, requireAdmin, broadcastNotification);
// router.post("/send-user", requireAuth, requireAdmin, sendToUser);
// router.put("/:id/read", requireAuth, markOneRead);



// export default router;
import express from "express";
import {
  getMyNotifications,
  markAllRead,
  markOneRead,
  broadcastNotification,
  sendPrivateNotification
} from "../controllers/notificationController.js";

import { requireAuth, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// USER nhận thông báo của chính mình
router.get("/my", requireAuth, getMyNotifications);

// USER: đánh dấu đã đọc
router.put("/mark-all-read", requireAuth, markAllRead);
router.put("/:id/read", requireAuth, markOneRead);

// ADMIN: gửi broadcast toàn hệ thống
router.post("/broadcast", requireAuth, requireAdmin, broadcastNotification);

// ADMIN: gửi thông báo riêng cho 1 user
router.post("/private", requireAuth, requireAdmin, sendPrivateNotification);


export default router;

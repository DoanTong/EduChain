// import express from "express";
// import SessionResult from "../models/SessionResult.js";
// import User from "../models/User.js";

// import { 
//   saveSessionResult, 
//   getMySessionResults, 
//   getReviewBySession,
//   getPublishedResults, 
//   getEligibleForCertificate
// } from "../controllers/sessionResultController.js";

// import { requireAuth } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// // ----------------------
// // STATIC ROUTES FIRST
// // ----------------------

// router.post("/", requireAuth, saveSessionResult);
// router.get("/my", requireAuth, getMySessionResults);

// router.get("/published", getPublishedResults);
// router.get("/published/eligible", getEligibleForCertificate);

// // ⭐ LEADERBOARD — PHẢI ĐẶT TRƯỚC ROUTE ĐỘNG
// router.get("/leaderboard", async (req, res) => {
//   try {
//     const results = await SessionResult.find({ mode: "published" })
//       .populate("user", "name avatar")   // <<--- CHỈNH LẠI NÀY
//       .lean();

//     const mapped = results
//       .map(r => ({
//         fullName: r.user?.name || "Không rõ",
//         avatar: r.user?.avatar
//           ? `${process.env.BASE_URL}${r.user.avatar}`
//           : null,
//         accuracy: r.accuracy || 0,
//       }))
//       .sort((a, b) => b.accuracy - a.accuracy)
//       .slice(0, 5);

//     res.json({ data: mapped });

//   } catch (err) {
//     console.error("Leaderboard error:", err);
//     res.status(500).json({ message: "Lỗi tải bảng xếp hạng" });
//   }
// });

// // ⭐ ROUTE ĐỘNG PHẢI ĐỂ SAU CÙNG
// router.get("/:sessionId/review", requireAuth, getReviewBySession);



// // ----------------------
// // DYNAMIC ROUTES LAST
// // ----------------------
// router.get("/:sessionId/review", requireAuth, getReviewBySession);

// export default router;
import express from "express";
import SessionResult from "../models/SessionResult.js";
import User from "../models/User.js";

import { 
  saveSessionResult, 
  getMySessionResults, 
  getReviewBySession,
  getPublishedResults, 
  getEligibleForCertificate
} from "../controllers/sessionResultController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ============================
   STATIC ROUTES (MATCH FIRST)
=============================== */
router.post("/", requireAuth, saveSessionResult);
router.get("/my", requireAuth, getMySessionResults);

router.get("/published", getPublishedResults);
router.get("/published/eligible", getEligibleForCertificate);

/* ============================
   LEADERBOARD (MUST BE BEFORE DYNAMIC)
=============================== */
router.get("/leaderboard", async (req, res) => {
  try {
    const results = await SessionResult.find({ mode: "published" })
      .populate("user", "name avatar")
      .lean();

    const mapped = results
      .map(r => ({
        fullName: r.user?.name || "Không rõ",
        avatar: r.user?.avatar
          ? `${process.env.API_BASE_URL}${r.user.avatar}`
          : null,
        accuracy: r.accuracy || 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    res.json({ data: mapped });

  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Lỗi tải bảng xếp hạng" });
  }
});

/* ============================
   DYNAMIC ROUTE — ALWAYS LAST
=============================== */
router.get("/:sessionId/review", requireAuth, getReviewBySession);

export default router;

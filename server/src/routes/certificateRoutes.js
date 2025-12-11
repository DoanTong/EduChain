import express from "express";
import {
  createCertificate,
  getPendingCertificates,
  getCertificates,
  getCertificatesByWallet,
  mintCertificate,
  verifyCertificate     
} from "../controllers/certificateController.js";

const router = express.Router();

// Tạo chứng chỉ (DB record)
router.post("/", createCertificate);

// Lấy certificate theo wallet
router.get("/my", getCertificatesByWallet);

// Admin xem chứng chỉ chờ duyệt
router.get("/pending", getPendingCertificates);

// Lấy tất cả
router.get("/", getCertificates);

// Mint NFT
router.put("/:id/mint", mintCertificate);

router.get("/verify/:contentHash", verifyCertificate);


export default router;

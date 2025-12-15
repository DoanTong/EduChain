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

// 1) Static routes FIRST
router.get("/verify/:contentHash", verifyCertificate);
router.get("/pending", getPendingCertificates);

// 2) My certificates
router.get("/my", getCertificatesByWallet);

// 3) CRUD / list
router.post("/", createCertificate);
router.get("/", getCertificates);

// 4) Dynamic routes LAST
router.put("/:id/mint", mintCertificate);

export default router;

import express from "express";
import { getResultsByExam, createResult } from "../controllers/resultController.js";
const router = express.Router();

router.get("/:examId", getResultsByExam);
router.post("/", createResult);

export default router;

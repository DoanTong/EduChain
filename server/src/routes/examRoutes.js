import express from "express";
import { getExams, createExam } from "../controllers/examController.js";
const router = express.Router();

router.get("/", getExams);
router.post("/", createExam);

export default router;

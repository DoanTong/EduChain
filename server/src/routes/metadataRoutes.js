import express from "express";
import { getMetadata } from "../controllers/metadataController.js";

const router = express.Router();

router.get("/:contentHash", getMetadata);

export default router;

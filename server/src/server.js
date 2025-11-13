import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";import authRoutes from "./routes/authRoutes.js";




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB đã kết nối!"))
  .catch((err) => console.error("❌ Kết nối Mongo thất bại:", err));

// ✅ Các route chính
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/certificates", certificateRoutes);


app.get("/", (req, res) => res.send("EduChain Mongo API 🚀"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại http://localhost:${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import examSessionRoutes from "./routes/examSessionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import importZipRoutes from "./routes/importZipRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import sessionResultRoutes from "./routes/sessionResultRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";

import User from "./models/User.js";

dotenv.config();

// =========================================================
// EXPRESS APP
// =========================================================
const app = express();
app.use(cors());
app.use(express.json());

// =========================================================
// HTTP + SOCKET.IO
// =========================================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Cho phép chỗ khác import để gửi thông báo (RightPanel)
export const ioInstance = io;

// =========================================================
// REALTIME ONLINE USERS — CHUẨN FACEBOOK
// =========================================================

// Map lưu userId -> socketId
const onlineUsers = new Map();

/* Emit full danh sách online */
async function emitOnlineUsers() {
  const ids = [...onlineUsers.keys()];

  // Lấy thông tin user theo danh sách id đang online
  const users = await User.find({ _id: { $in: ids } })
    .select("_id name avatar role");

  io.emit("online-users", users);
}

// SOCKET MAIN LOGIC
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // Khi FE gửi userId để bind vào socket
socket.on("bind-user", async (userId) => {
  socket.userId = userId;

  // cập nhật lastActive ngay khi user hoạt động
  await User.findByIdAndUpdate(userId, { lastActive: Date.now() });

  onlineUsers.set(userId, socket.id);
  io.emit("user-online", { _id: userId });
  emitOnlineUsers();
});


  // Khi user đóng tab / mất kết nối
socket.on("disconnect", async () => {
  if (socket.userId) {
    await User.findByIdAndUpdate(socket.userId, { lastActive: Date.now() });

    onlineUsers.delete(socket.userId);
    io.emit("user-offline", socket.userId);
    emitOnlineUsers();
  }
});

});

// =========================================================
// STATIC FILES
// =========================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/metadata", metadataRoutes);
app.use("/metadata", express.static(path.join(__dirname, "metadata")));

app.use(
  "/certificate-templates",
  express.static(path.join(__dirname, "public/certificate-templates"))
);

// =========================================================
// MONGO CONNECT
// =========================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// =========================================================
// API ROUTES
// =========================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/exam-sessions", examSessionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/import", importRoutes);
app.use("/api/import", importZipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/session-results", sessionResultRoutes);
app.use("/api/examsessions", examSessionRoutes);

app.get("/", (req, res) => res.send("EduChain Mongo API + SOCKET.IO 🚀"));

// =========================================================
// START SERVER
// =========================================================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});

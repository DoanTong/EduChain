import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { ioInstance as io } from "../server.js";
// ---------------------------------------------------------------------
// GỬI THÔNG BÁO CHO TOÀN BỘ USER
// ---------------------------------------------------------------------
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type = "system", sessionId = null } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Thiếu title hoặc message" });
    }

    const users = await User.find({}, "_id");

    const notiList = users.map((u) => ({
      user: u._id,
      title,
      message,
      type,
      sessionId,
    }));

    await Notification.insertMany(notiList);

    res.status(200).json({
      success: true,
      message: "Gửi broadcast thành công",
      count: notiList.length,
    });
  } catch (err) {
    console.error("Broadcast error:", err);
    res.status(500).json({ message: "Broadcast failed" });
  }
};

// ---------------------------------------------------------------------
// GỬI THÔNG BÁO CHO MỘT USER
// ---------------------------------------------------------------------
export const sendToUser = async (req, res) => {
  try {
    const { userId, title, message, type = "custom", sessionId = null } =
      req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const noti = await Notification.create({
      user: userId,
      title,
      message,
      type,
      sessionId,
    });

    res.status(200).json({ success: true, data: noti });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Send notification failed" });
  }
};

// ---------------------------------------------------------------------
// LẤY DANH SÁCH THÔNG BÁO CỦA USER HIỆN TẠI
// ---------------------------------------------------------------------
export const getMyNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Load notifications failed" });
  }
};
export const sendPrivateNotification = async (req, res) => {
  try {
    const { toUserId, title, message } = req.body;

    if (!toUserId || !message) {
      return res.status(400).json({ message: "Thiếu userId hoặc message" });
    }

    // Lưu DB
    const noti = await Notification.create({
      user: toUserId,
      title: title || "Thông báo",
      message,
    });

    // Emit theo ROOM user riêng (đúng chuẩn)
    io.to(toUserId).emit("new-notification", {
      user: toUserId,
      title,
      message,
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Đã gửi thông báo riêng",
      data: noti,
    });

  } catch (err) {
    console.error("sendPrivateNotification ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------
// ĐÁNH DẤU TẤT CẢ THÔNG BÁO LÀ ĐÃ ĐỌC
// ---------------------------------------------------------------------
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: "Marked all as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mark read failed" });
  }
};
// Đánh dấu 1 thông báo đã đọc
// Đánh dấu 1 thông báo đã đọc
export const markOneRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const noti = await Notification.findOne({
      _id: id,
      user: userId   // ⬅️ SỬA: phải là user, không phải userId
    });

    if (!noti) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo"
      });
    }

    noti.read = true;
    await noti.save();

    res.json({
      success: true,
      message: "Đã đánh dấu đã đọc",
      data: noti
    });

  } catch (err) {
    console.error("markOneRead ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

import User from "../models/User.js";
import bcrypt from "bcrypt";
import path from "path";

// ============================================================
// UPDATE NAME
// ============================================================
export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name.trim()) return res.status(400).json({ message: "Tên không hợp lệ" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    );

    res.json({ message: "Updated", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================
// src/controllers/userController.js

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) return res.status(400).json({ message: "Không tìm thấy user" });

    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Sai mật khẩu hiện tại" });
    }

    user.password = newPassword;   // plaintext
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


// ============================================================
// UPDATE WALLET
// ============================================================
export const updateWallet = async (req, res) => {
  try {
    const { wallet } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { wallet: wallet || null },
      { new: true }
    ).select("-password");

    res.json({
      message: "Wallet updated",
      wallet: user.wallet,
      user,
    });
  } catch (err) {
    console.error("Update wallet error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ============================================================
// UPLOAD AVATAR
// ============================================================
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated",
      avatarUrl,
      user,
    });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Lỗi upload" });
  }
};
export const getQuickProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name email avatar createdAt bio");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ data: user });
  } catch (err) {
    console.error("Quick profile error", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // OPTIONAL: thêm dữ liệu thống kê cá nhân
    // Nếu bạn có bảng exam sessions, results... thì nhét vào đây luôn
    user.examCount = user.examCount ?? 0;
    user.highestScore = user.highestScore ?? "-";

    return res.json({ data: user });
  } catch (err) {
    console.error("Full profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

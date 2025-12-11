import User from "../models/User.js";
import Exam from "../models/Exam.js";           
import SessionResult from "../models/SessionResult.js"; 

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role locked createdAt");
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};



export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    await User.findByIdAndUpdate(req.params.id, { role });

    res.json({ message: "Cập nhật quyền thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Xóa người dùng thành công!" });
};

export const toggleLockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

  user.locked = !user.locked;
  await user.save();

  res.json({
    message: user.locked ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
    locked: user.locked
  });
};

export const resetPassword = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    password: "123456",
  });
  res.json({ message: "Đặt lại mật khẩu về 123456" });
};
// ============================================
// 1) USERS ĐANG ONLINE
// ============================================
export const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({ isOnline: true })
      .select("_id name avatar role");

    return res.json({ success: true, data: users });
  } catch (err) {
    console.log("ONLINE USERS ERROR:", err);
    return res.status(500).json({ success: false });
  }
};

// ============================================
// 2) DASHBOARD STATS
// ============================================
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();

    const results = await SessionResult.find();

    let totalAccuracy = 0;
    let passCount = 0;

    results.forEach(r => {
      totalAccuracy += r.accuracy;
      if (r.accuracy >= 50) passCount++;
    });

    const avgScore = results.length
      ? Math.round(totalAccuracy / results.length)
      : 0;

    const passRate = results.length
      ? Math.round((passCount / results.length) * 100)
      : 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalExams,
        avgScore,
        passRate
      }
    });

  } catch (err) {
    console.log("STATS ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


// ============================================
// 3) CHART: SCORE TREND
// ============================================
export const getScoreChart = async (req, res) => {
  try {
    const recent = await SessionResult.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("accuracy createdAt");

    const mapped = recent.reverse().map(r => ({
      date: r.createdAt.toISOString().slice(5, 10), // MM-DD
      score: Math.round(r.accuracy || 0)
    }));

    return res.json({ success: true, data: mapped });

  } catch (err) {
    console.log("CHART ERROR:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
export const getAllExamSessions = async (req, res) => {
  try {
    const list = await ExamSession.find().select("title status createdAt");
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Load exam sessions failed" });
  }
};

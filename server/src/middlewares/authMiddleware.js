// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const requireAuth = async (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization;
//   const token = authHeader?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Chưa đăng nhập" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).json({ message: "Tài khoản không tồn tại" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token không hợp lệ" });
//   }
// };

// export const requireAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({ message: "Không có quyền admin" });
//   }
//   next();
// };
// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    // ✅ locked là boolean true/false
    if (user.locked === true) {
      return res
        .status(403)
        .json({ message: "Tài khoản đã bị khoá, vui lòng liên hệ admin." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
};

// import SessionResult from "../models/SessionResult.js";

// export const getMetadata = async (req, res) => {
//   try {
//     const raw = String(req.params.contentHash || "").trim();
//     if (!raw) return res.status(400).json({ error: "Missing contentHash" });

//     // ✅ FIX: bỏ .json nếu FE gọi /metadata/result-xxx.json
//     const contentHash = raw.replace(/\.json$/i, "");

//     // chỉ nhận dạng result-xxxx
//     if (!contentHash.startsWith("result-")) {
//       return res.status(400).json({ error: "Invalid contentHash format" });
//     }

//     const sessionResultId = contentHash.replace("result-", "");

//     const result = await SessionResult.findById(sessionResultId)
//       .populate("user", "name email wallet avatar")
//       .populate("session", "title");

//     if (!result) {
//       return res.status(404).json({ error: "Metadata not found" });
//     }

//     const apiBase = normBase(process.env.API_BASE_URL, "http://localhost:4000");
//     const feBase = normBase(process.env.FRONTEND_URL, "http://localhost:5173");

//     const accuracy = result.accuracy || 0;
//     const score = result.totalScore || accuracy;
//     const examTitle = result.session?.title || "Exam";

//     const studentName = result.user?.name || "Student";
//     const email = result.user?.email || "";
//     const wallet = result.user?.wallet || "";

//     // ✅ ảnh template chứng chỉ (đúng server bạn đang serve /certificate-templates)
//     const certImg = new URL(
//       "/certificate-templates/toeic-default.png",
//       apiBase
//     ).toString();

//     // ✅ link verify ngoài FE
//     const verifyUrl = new URL(`/verify/result/${contentHash}`, feBase).toString();

//     // ✅ QR dạng base64 (khỏi bị chặn như qrserver)
//     const qrBase64 = await QRCode.toDataURL(verifyUrl);

//     const avatar = normAvatar(result.user?.avatar, apiBase, studentName);

//     const metadata = {
//       name: `EduChain Certificate - ${examTitle}`,
//       description: `Certificate for the exam "${examTitle}", awarded to ${studentName}.`,
//       image: certImg,
//       external_url: verifyUrl,
//       attributes: [
//         { trait_type: "Student", value: studentName },
//         { trait_type: "Email", value: email },
//         { trait_type: "Wallet", value: wallet },
//         { trait_type: "Avatar", value: avatar },
//         { trait_type: "Exam", value: examTitle },
//         { trait_type: "Accuracy", value: `${accuracy}%` },
//         { trait_type: "Score", value: `${score}` },
//         { trait_type: "QR", value: qrBase64 },
//         { trait_type: "ContentHash", value: contentHash },
//       ],
//     };

//     // optional cache (đỡ load nhiều)
//     res.setHeader("Cache-Control", "public, max-age=60");
//     return res.json(metadata);
//   } catch (err) {
//     console.error("Metadata error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };
import QRCode from "qrcode";
import SessionResult from "../models/SessionResult.js";

// ======================================================
// HELPERS
// ======================================================
function normBase(raw, fallback) {
  let base = String(raw || "").trim();
  if (!base) base = fallback;

  // nếu thiếu protocol (hay gặp khi set domain trần)
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;

  // đảm bảo có dấu / cuối để new URL() ghép path đúng
  if (!base.endsWith("/")) base += "/";

  return base;
}

function normAvatar(rawAvatar, apiBase, studentName) {
  const name = studentName || "Student";
  const a = String(rawAvatar || "").trim();

  if (!a) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }

  // nếu avatar đã là URL đầy đủ
  if (/^https?:\/\//i.test(a)) {
    // nếu lỡ lưu localhost trong DB, thay bằng apiBase
    return a.replace(/^http:\/\/localhost:\d+\//i, apiBase);
  }

  // nếu avatar dạng "/uploads/..." hoặc "uploads/..."
  const cleaned = a.replace(/^\//, "");
  return new URL(cleaned, apiBase).toString();
}

// ======================================================
// GET METADATA
// ======================================================
export const getMetadata = async (req, res) => {
  try {
    const raw = String(req.params.contentHash || "").trim();
    if (!raw) return res.status(400).json({ error: "Missing contentHash" });

    // FE có thể gọi /metadata/result-xxx.json
    const contentHash = raw.replace(/\.json$/i, "");

    if (!contentHash.startsWith("result-")) {
      return res.status(400).json({ error: "Invalid contentHash format" });
    }

    const sessionResultId = contentHash.replace("result-", "");

    const result = await SessionResult.findById(sessionResultId)
      .populate("user", "name email wallet avatar")
      .populate("session", "title");

    if (!result) return res.status(404).json({ error: "Metadata not found" });

    const apiBase = normBase(process.env.API_BASE_URL, "http://localhost:4000");
    const feBase = normBase(process.env.FRONTEND_URL, "http://localhost:5173");

    const accuracy = result.accuracy || 0;
    const score = result.totalScore || accuracy;

    const examTitle = result.session?.title || "Exam";
    const studentName = result.user?.name || "Student";
    const email = result.user?.email || "";
    const wallet = result.user?.wallet || "";

    // ảnh template chứng chỉ (server đang serve /certificate-templates)
    const certImg = new URL("certificate-templates/toeic-default.png", apiBase).toString();

    // link verify phía FE
    const verifyUrl = new URL(`verify/result/${contentHash}`, feBase).toString();

    // QR base64
    const qrBase64 = await QRCode.toDataURL(verifyUrl);

    // avatar chuẩn hoá
    const avatar = normAvatar(result.user?.avatar, apiBase, studentName);

    const metadata = {
      name: `EduChain Certificate - ${examTitle}`,
      description: `Certificate for the exam "${examTitle}", awarded to ${studentName}.`,
      image: certImg,
      external_url: verifyUrl,
      attributes: [
        { trait_type: "Student", value: studentName },
        { trait_type: "Email", value: email },
        { trait_type: "Wallet", value: wallet },
        { trait_type: "Avatar", value: avatar },
        { trait_type: "Exam", value: examTitle },
        { trait_type: "Accuracy", value: `${accuracy}%` },
        { trait_type: "Score", value: `${score}` },
        { trait_type: "QR", value: qrBase64 },
        { trait_type: "ContentHash", value: contentHash },
      ],
    };

    res.setHeader("Cache-Control", "public, max-age=60");
    return res.json(metadata);
  } catch (err) {
    console.error("Metadata error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// import SessionResult from "../models/SessionResult.js";

// export const getMetadata = async (req, res) => {
//   try {
//     const { contentHash } = req.params;

//     // contentHash example: "result-69312fe004..."
//     const sessionResultId = contentHash.replace("result-", "");

//     const result = await SessionResult.findById(sessionResultId)
//       .populate("user", "name email wallet")
//       .populate("session", "title");

//     if (!result) {
//       return res.status(404).json({ error: "Metadata not found" });
//     }

//     const metadata = {
//       name: `EduChain Certificate - ${result.session.title}`,
//       description: `Certificate for exam "${result.session.title}" awarded to ${result.user.name}.`,
//       image: "https://educhain.com/default-certificate.png", // placeholder
//       attributes: [
//         { trait_type: "Student", value: result.user.name },
//         { trait_type: "Email", value: result.user.email },
//         { trait_type: "Wallet", value: result.user.wallet },
//         { trait_type: "Score", value: `${result.accuracy}%` },
//         { trait_type: "Exam", value: result.session.title },
//       ]
//     };

//     return res.json(metadata);

//   } catch (err) {
//     console.error("Metadata error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
import SessionResult from "../models/SessionResult.js";

export const getMetadata = async (req, res) => {
  try {
    const raw = String(req.params.contentHash || "").trim();
    if (!raw) return res.status(400).json({ error: "Missing contentHash" });

    // ✅ FIX: bỏ .json nếu FE gọi /metadata/result-xxx.json
    const contentHash = raw.replace(/\.json$/i, "");

    // chỉ nhận dạng result-xxxx
    if (!contentHash.startsWith("result-")) {
      return res.status(400).json({ error: "Invalid contentHash format" });
    }

    const sessionResultId = contentHash.replace("result-", "");

    const result = await SessionResult.findById(sessionResultId)
      .populate("user", "name email wallet avatar")
      .populate("session", "title");

    if (!result) {
      return res.status(404).json({ error: "Metadata not found" });
    }

    const apiBase = normBase(process.env.API_BASE_URL, "http://localhost:4000");
    const feBase = normBase(process.env.FRONTEND_URL, "http://localhost:5173");

    const accuracy = result.accuracy || 0;
    const score = result.totalScore || accuracy;
    const examTitle = result.session?.title || "Exam";

    const studentName = result.user?.name || "Student";
    const email = result.user?.email || "";
    const wallet = result.user?.wallet || "";

    // ✅ ảnh template chứng chỉ (đúng server bạn đang serve /certificate-templates)
    const certImg = new URL(
      "/certificate-templates/toeic-default.png",
      apiBase
    ).toString();

    // ✅ link verify ngoài FE
    const verifyUrl = new URL(`/verify/result/${contentHash}`, feBase).toString();

    // ✅ QR dạng base64 (khỏi bị chặn như qrserver)
    const qrBase64 = await QRCode.toDataURL(verifyUrl);

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

    // optional cache (đỡ load nhiều)
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.json(metadata);
  } catch (err) {
    console.error("Metadata error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
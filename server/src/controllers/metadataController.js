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
    const { contentHash } = req.params;

    // contentHash example: "result-69312fe004..."
    const sessionResultId = contentHash.replace("result-", "");

    const result = await SessionResult.findById(sessionResultId)
      .populate("user", "name email wallet avatar")
      .populate("session", "title");

    if (!result) {
      return res.status(404).json({ error: "Metadata not found" });
    }

    // ===== CALCULATE FIELDS =====
    const accuracy = result.accuracy || 0;
    const score = result.totalScore || accuracy; // fallback
    const avatar = result.user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(result.user.name);
    const examTitle = result.session.title;

    // CERT IMAGE
    // Nếu bạn có template riêng thì đưa vào đây
    const certImg = `https://yourcdn.com/certificate-templates/toeic-default.png`;

    // QR VERIFY LINK
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://educhain.com/verify/${contentHash}`;

    // ===== METADATA JSON =====
    const metadata = {
      name: `EduChain Certificate - ${examTitle}`,
      description: `Certificate for the exam "${examTitle}", awarded to ${result.user.name}.`,
      image: certImg, // Bạn sẽ thay bằng ảnh certificate thật
      external_url: `https://educhain.com/certificate/${contentHash}`,

      attributes: [
        { trait_type: "Student", value: result.user.name },
        { trait_type: "Email", value: result.user.email },
        { trait_type: "Wallet", value: result.user.wallet },
        { trait_type: "Avatar", value: avatar },      // 🔥 THÊM avatar
        { trait_type: "Exam", value: examTitle },

        // kết quả
        { trait_type: "Accuracy", value: `${accuracy}%` },   // 🔥 accuracy chuẩn
        { trait_type: "Score", value: `${score}` },          // score hoặc accuracy fallback

        // verify
        { trait_type: "QR", value: qrUrl },
        { trait_type: "ContentHash", value: contentHash }
      ]
    };

    return res.json(metadata);

  } catch (err) {
    console.error("Metadata error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

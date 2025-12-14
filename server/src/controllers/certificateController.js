import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Certificate from "../models/Certificate.js";
import SessionResult from "../models/SessionResult.js";
import { mintCertificateOnChain } from "../services/certificateBlockchain.js";

import QRCode from "qrcode";


// ====================================================================
// FIX __dirname for ES Modules
// ====================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 💾 Save metadata to: server/src/metadata/
const metadataFolder = path.join(__dirname, "../metadata");

// Create metadata folder if not exist
if (!fs.existsSync(metadataFolder)) {
  fs.mkdirSync(metadataFolder, { recursive: true });
  console.log("📁 Created metadata folder:", metadataFolder);
}

// ====================================================================
// 1) CREATE CERTIFICATE (Chưa mint NFT)
// ====================================================================
export const createCertificate = async (req, res) => {
  try {
    const { sessionResultId } = req.body;
    if (!sessionResultId)
      return res.status(400).json({ success: false, message: "sessionResultId is required" });

    const result = await SessionResult.findById(sessionResultId)
      .populate("user", "name email wallet")
      .populate("session", "title");

    if (!result)
      return res.status(404).json({ success: false, message: "Session result not found" });

    if (result.accuracy < 50)
      return res.status(400).json({ success: false, message: "User not eligible" });

    if (!result.user.wallet)
      return res.status(400).json({ success: false, message: "User has no wallet" });

    const exists = await Certificate.findOne({
      user: result.user._id,
      examId: result.session._id,
    });

    if (exists)
      return res.status(400).json({ success: false, message: "Certificate already created" });

    const cert = await Certificate.create({
      user: result.user._id,
      studentWallet: result.user.wallet,
      examId: result.session._id,
      contentHash: `result-${sessionResultId}`,
      status: "created"
    });

    return res.json({ success: true, cert });

  } catch (err) {
    console.error("❌ createCertificate error:", err);
    res.status(500).json({ success: false });
  }
};

// ====================================================================
// 2) GET PENDING CERTIFICATES
// ====================================================================
export const getPendingCertificates = async (req, res) => {
  try {
    const list = await Certificate.find({ status: "created" })
      .populate("user", "name email wallet")
      .populate("examId", "title")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("❌ getPendingCertificates error:", err);
    res.status(500).json({ success: false });
  }
};

// ====================================================================
// 3) MINT CERTIFICATE (Create metadata + Mint NFT)
// ====================================================================
// export const mintCertificate = async (req, res) => {
//   try {
//     const certId = req.params.id;
//     const cert = await Certificate.findById(certId)
//       .populate("user", "name email wallet avatar")
//       .populate("examId", "title");

//     if (!cert)
//       return res.status(404).json({ success: false, message: "Certificate not found" });

//     // 🔥 MUST FETCH session result for accuracy & score
//     const result = await SessionResult.findOne({
//       _id: cert.contentHash.replace("result-", "")
//     });

//     if (!result)
//       return res.status(400).json({ message: "Session result not found!" });

//     const accuracy = result.accuracy || 0;
//     const score = result.totalScore || accuracy;
//     const avatar = cert.user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(cert.user.name);

//     const metadata = {
//       name: `EduChain Certificate - ${cert.examId.title}`,
//       description: `Awarded to ${cert.user.name}`,
//       image: "https://educhain.com/default-certificate.png",
//       attributes: [
//         { trait_type: "Student", value: cert.user.name },
//         { trait_type: "Email", value: cert.user.email },
//         { trait_type: "Wallet", value: cert.user.wallet },
//         { trait_type: "Avatar", value: avatar },
//         { trait_type: "Exam", value: cert.examId.title },
//         { trait_type: "Score", value: score },
//         { trait_type: "Accuracy", value: `${accuracy}%` },
//       ]
//     };

//     const fileName = `${cert.contentHash}.json`;
//     const filePath = path.join(metadataFolder, fileName);

//     fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

//     const finalURL = `${process.env.API_BASE_URL}/metadata/${fileName}`;

//     const chain = await mintCertificateOnChain(cert.studentWallet, finalURL);

//     cert.metadataUri = finalURL;
//     cert.txHash = chain.txHash;
//     cert.tokenId = chain.tokenId;
//     cert.contract = process.env.CERTIFICATE_CONTRACT;
//     cert.status = "minted";

//     await cert.save();

//     return res.json({ success: true, cert });

//   } catch (err) {
//     console.error("❌ mintCertificate error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Mint failed — check blockchain or metadata"
//     });
//   }
// };
export const mintCertificate = async (req, res) => {
  try {
    const certId = req.params.id;
    console.log("🔥 Mint request received for cert:", certId);

    // ==========================================
    // 1) LOAD CERTIFICATE + USER + EXAM
    // ==========================================
    const cert = await Certificate.findById(certId)
      .populate("user", "name email wallet avatar")
      .populate("examId", "title");

    if (!cert)
      return res.status(404).json({ success: false, message: "Certificate not found" });

    // ==========================================
    // 2) FIND SESSION RESULT FOR SCORE + ACCURACY
    // ==========================================
    const sessionId = cert.contentHash.replace("result-", "");
    const result = await SessionResult.findById(sessionId);

    if (!result)
      return res.status(400).json({ success: false, message: "Session result not found!" });

    const accuracy = result.accuracy || 0;
    const score = result.totalScore || accuracy;

    // ==========================================
    // 3) PREPARE CERTIFICATE FIELDS
    // ==========================================
    const examTitle = cert.examId.title;

    const avatar = cert.user.avatar
  ? `${process.env.API_BASE_URL}${cert.user.avatar}`
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(cert.user.name)}`;
    // Ảnh background template chứng chỉ
    const certImg = `${process.env.API_BASE_URL}/certificate-templates/toeic-default.png`;

    // QR VERIFY LINK → ở dạng Base64 (không bị chặn bởi AdBlock)

// const qrBase64 = await QRCode.toDataURL(
//   `${process.env.FRONTEND_URL}/verify/result/${cert.contentHash}`
// );

const verifyUrl = new URL(
  `/verify/result/${cert.contentHash}`,
  process.env.FRONTEND_URL || "http://localhost:5173"
).toString();

const qrBase64 = await QRCode.toDataURL(verifyUrl);



    // ==========================================
    // 4) BUILD METADATA JSON
    // ==========================================
    const metadata = {
      name: `EduChain Certificate - ${examTitle}`,
      description: `Certificate for the exam "${examTitle}", awarded to ${cert.user.name}.`,
      image: certImg,
      external_url: verifyUrl,
      attributes: [
        { trait_type: "Student", value: cert.user.name },
        { trait_type: "Email", value: cert.user.email },
        { trait_type: "Wallet", value: cert.studentWallet },
        { trait_type: "Avatar", value: avatar },
        { trait_type: "Exam", value: examTitle },
        { trait_type: "Accuracy", value: `${accuracy}%` },
        { trait_type: "Score", value: `${score}` },
        { trait_type: "QR", value: qrBase64 },
        { trait_type: "ContentHash", value: cert.contentHash }
      ]
    };

    // ==========================================
    // 5) SAVE METADATA JSON TO DISK
    // ==========================================
    const fileName = `${cert.contentHash}.json`;
    const filePath = path.join(metadataFolder, fileName);

    console.log("💾 Saving metadata to:", filePath);

    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

    const finalURL = `${process.env.API_BASE_URL}/metadata/${fileName}`;

    // ==========================================
    // 6) MINT CERTIFICATE ON CHAIN
    // ==========================================
    const chain = await mintCertificateOnChain(cert.studentWallet, finalURL);

    // ==========================================
    // 7) UPDATE DATABASE
    // ==========================================
    cert.metadataUri = finalURL;
    cert.txHash = chain.txHash;
    cert.tokenId = chain.tokenId;
    cert.contract = process.env.CERTIFICATE_CONTRACT;
    cert.status = "minted";

    await cert.save();

    return res.json({ success: true, cert });

  } catch (err) {
    console.error("❌ mintCertificate error:", err);
    return res.status(500).json({
      success: false,
      message: "Mint failed — check blockchain or metadata"
    });
  }
};


// ====================================================================
// 4) GET CERTIFICATES BY WALLET
// ====================================================================
export const getCertificatesByWallet = async (req, res) => {
  try {
    let wallet = req.query.wallet?.toLowerCase();
    if (!wallet)
      return res.status(400).json({ success: false, message: "Wallet missing" });

    const certs = await Certificate.find({
      studentWallet: new RegExp(`^${wallet}$`, "i")
    });

    return res.json({ success: true, data: certs });

  } catch (err) {
    console.error("❌ getCertificatesByWallet error:", err);
    res.status(500).json({ success: false });
  }
};

// ====================================================================
// 5) GET ALL CERTIFICATES
// ====================================================================
export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate("user", "name email wallet")
      .populate("examId", "title")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: certs });

  } catch (err) {
    console.error("❌ getCertificates error:", err);
    res.status(500).json({ success: false });
  }
};

// export const verifyCertificate = async (req, res) => {
//   try {
//     const { contentHash } = req.params;

//     // 1) Tìm certificate theo contentHash
//     const cert = await Certificate.findOne({ contentHash })
//       .populate("user", "name email wallet avatar")
//       .populate("examId", "title");

//     if (!cert)
//       return res.status(404).json({ success: false, message: "Certificate not found" });

//     // Lấy sessionResultId từ contentHash
//     const sessionResultId = contentHash.replace("result-", "");

//     // 2) Lấy kết quả bài thi để lấy điểm & accuracy
//     const result = await SessionResult.findById(sessionResultId);
//     const verifyUrl = new URL(
//       `/verify/result/${contentHash}`,
//       process.env.FRONTEND_URL || "http://localhost:5173"
//     ).toString();

//     return res.json({
//       success: true,
//       data: {
//         studentName: cert.user.name,
//         email: cert.user.email,
//         examTitle: cert.examId.title,
//         score: result?.totalScore || 0,
//         accuracy: result?.accuracy || 0,
        
//          avatar: cert.user.avatar
//           ? `${process.env.API_BASE_URL}${cert.user.avatar}`
//           : `https://ui-avatars.com/api/?name=${encodeURIComponent(cert.user.name)}`,
//         tokenId: cert.tokenId,
//         txHash: cert.txHash,
//         verifyUrl,
//         contentHash: cert.contentHash
//       }
//     });

//   } catch (err) {
//     console.error("verifyCertificate error:", err);
//     res.status(500).json({ success: false });
//   }
// };
export const verifyCertificate = async (req, res) => {
  try {
    const { contentHash } = req.params;

    const cert = await Certificate.findOne({ contentHash })
      .populate("user", "name email wallet avatar")
      .populate("examId", "title");

    if (!cert)
      return res.status(404).json({ success: false, message: "Certificate not found" });

    const sessionResultId = contentHash.replace("result-", "");
    const result = await SessionResult.findById(sessionResultId);

    const verifyUrl = new URL(
      `/verify/result/${contentHash}`,
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).toString();

    // ✅ normalize API base (đảm bảo có https://)
    const apiBase = (process.env.API_BASE_URL || "http://localhost:4000").startsWith("http")
      ? process.env.API_BASE_URL
      : `https://${process.env.API_BASE_URL}`;

    // ✅ normalize avatar url
    let avatarUrl;
    const rawAvatar = cert.user.avatar;

    if (rawAvatar?.startsWith("http")) {
      // Nếu DB lỡ lưu http://localhost... thì thay bằng domain thật
      avatarUrl = rawAvatar.replace(/^http:\/\/localhost:\d+/, apiBase);
    } else if (rawAvatar) {
      // Nếu DB lưu dạng /uploads/...
      avatarUrl = new URL(rawAvatar, apiBase).toString();
    } else {
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cert.user.name)}`;
    }

    return res.json({
      success: true,
      data: {
        studentName: cert.user.name,
        email: cert.user.email,
        examTitle: cert.examId.title,
        score: result?.totalScore || 0,
        accuracy: result?.accuracy || 0,

        avatar: avatarUrl,
        tokenId: cert.tokenId,
        txHash: cert.txHash,
        verifyUrl,
        contentHash: cert.contentHash,
        
      }
    });
  } catch (err) {
    console.error("verifyCertificate error:", err);
    res.status(500).json({ success: false });
  }
};

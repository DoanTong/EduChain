import Certificate from "../models/Certificate.js";

export const createCertificate = async (req, res) => {
  try {
    const { studentWallet, examId, txHash, tokenUri, contentHash } = req.body;
    const cert = new Certificate({
      studentWallet,
      examId,
      txHash,
      tokenUri,
      contentHash,
    });
    await cert.save();

    res.json({ message: "✅ Cấp chứng chỉ thành công!", cert });
  } catch (err) {
    console.error("❌ Lỗi lưu chứng chỉ:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find().populate("examId", "title");
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

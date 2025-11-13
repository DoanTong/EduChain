import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  studentWallet: String,
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  txHash: String,
  tokenUri: String,
  contentHash: String,
  issuedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Certificate", certificateSchema);

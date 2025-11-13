import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  userName: String,
  email: String,
  walletAddress: String,
  score: Number,
  passScore: Number,
  metadataUri: String,
  contentHash: String,
});

export default mongoose.model("Result", resultSchema);

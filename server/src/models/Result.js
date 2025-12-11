import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  fullName: String,
  walletAddress: String,
  score: Number,
  metadataUri: String,
  contentHash: String,
  createdAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);


export default mongoose.model("Result", ResultSchema);

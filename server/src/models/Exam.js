import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalQuestions: { type: Number, default: 0 },
  passScore: { type: Number, default: 50 },
});

export default mongoose.model("Exam", examSchema);

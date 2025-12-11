import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    partNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    title: { type: String, required: true },
    description: { type: String },

    section: {
      type: String,
      enum: ["listening", "reading"],
      required: true,
    },

    durationMinutes: { type: Number, default: 0 },
    instructions: { type: String, default: "" },

    // Chỉ Part 1–4 dùng audio/ảnh của bài (nếu cần)
    audioUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },

    type: {
      type: String,
      enum: ["practice", "official"],
      default: "practice",
    },

    passScore: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", ExamSchema);

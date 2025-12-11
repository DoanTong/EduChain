import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    partNumber: { type: Number, required: true }, // 1–7

    // Media (Part 1–4)
    imageUrl: String,
    audioUrls: [String], // Part 1: 4 audio. Part 2: 1 audio
    script: String,      // transcript (nếu cần)

    // Part 1–2–3–4: không có question text (ứng viên chỉ nghe)
    // Part 5–6–7: có question text
    questionText: String,

    // Part 5 & Part 6 blanks, Part 1–4 chọn A–D
    options: [String],

    // chỉ 1 đáp án đúng: A/B/C/D → index 0–3
    answer: { type: Number, required: true },

    // Part 3–4–6–7: nhóm nhiều câu → dùng chung audio / passage
    groupKey: String,

    // Part 6–7 passages
    passage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Question", QuestionSchema);

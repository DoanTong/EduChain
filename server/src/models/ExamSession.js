import mongoose from "mongoose";

const { Schema } = mongoose;

const examSessionPartSchema = new Schema({
  exam: {
    type: Schema.Types.ObjectId,
    ref: "Exam",
    required: true, // bài thi nhỏ (Part)
  },
  label: {
    type: String,
    required: true, // ví dụ: "Part 1 - Listening"
  },
  order: {
    type: Number,
    default: 0, // thứ tự part
  },
  weight: {
    type: Number,
    default: 1, // trọng số điểm (nếu cần)
  },
  durationMinutes: {
    type: Number,
    default: 0, // thời gian cho part, optional
  },
});

const examSessionSchema = new Schema(
  {
    title: {
      type: String,
      required: true, // tên kỳ thi, ví dụ: "Full TOEIC Test 01"
    },
    description: String,
    status: {
      type: String,
      enum: ["draft","practice", "published"],
      default: "draft",
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalWeight: {
      type: Number,
      default: 0,
    },
    parts: [examSessionPartSchema],
  },
  { timestamps: true }
);

const ExamSession = mongoose.model("ExamSession", examSessionSchema);

export default ExamSession;

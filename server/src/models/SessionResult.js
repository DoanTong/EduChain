// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const sessionPartResultSchema = new Schema(
//   {
//     exam: {
//       type: Schema.Types.ObjectId,
//       ref: "Exam",
//       required: true,
//     },
//     label: String,            // label part (Part 1 – Listening)
//     correct: { type: Number, default: 0 },
//     total: { type: Number, default: 0 },
//   },
//   { _id: false }
// );

// const sessionResultSchema = new Schema(
//   {
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     session: {
//       type: Schema.Types.ObjectId,
//       ref: "ExamSession",
//       required: true,
//     },
//     answers: [
//   {
//     questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
//     answerIndex: { type: Number },
//   }
// ],


//     totalCorrect: { type: Number, default: 0 },
//     totalQuestions: { type: Number, default: 0 },
//     accuracy: { type: Number, default: 0 }, // 0–100 (%)

//     durationSeconds: { type: Number, default: 0 }, // thời gian làm bài (optional)

//     parts: [sessionPartResultSchema],
//   },
//   {
//     timestamps: true,
//   }
// );

// // Nếu user đã làm session đó rồi → cập nhật lại (upsert ngoài controller)
// sessionResultSchema.index({ user: 1, session: 1 }, { unique: true });

// const SessionResult = mongoose.model("SessionResult", sessionResultSchema);
// export default SessionResult;
import mongoose from "mongoose";

const { Schema } = mongoose;

const sessionPartResultSchema = new Schema(
  {
    exam: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    label: String,
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const sessionResultSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },

    // 🟩 THÊM TRƯỜNG MỚI ĐỂ PHÂN BIỆT PRACTICE HAY OFFICIAL:
   mode: {
  type: String,
  enum: ["practice", "published"],
  default: "practice",
  required: true
},

    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        answerIndex: { type: Number },
      }
    ],

    totalCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },

    durationSeconds: { type: Number, default: 0 },

    parts: [sessionPartResultSchema],
  },
  {
    timestamps: true,
  }
);

sessionResultSchema.index({ user: 1, session: 1 }, { unique: true });

const SessionResult = mongoose.model("SessionResult", sessionResultSchema);
export default SessionResult;

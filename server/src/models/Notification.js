import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["system", "exam-session", "score", "custom"],
      default: "system",
    },

    sessionId: { type: mongoose.Schema.Types.ObjectId, default: null },

    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);

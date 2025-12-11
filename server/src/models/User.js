// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    locked: { type: Boolean, default: false },
    wallet: { type: String, default: null },
    avatar: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
  
);

export default mongoose.model("User", userSchema);

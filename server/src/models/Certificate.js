// import mongoose from "mongoose";

// const certificateSchema = new mongoose.Schema({
//   studentWallet: String,
//   examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
//   txHash: String,
//   tokenUri: String,
//   contentHash: String,
//   issuedAt: { type: Date, default: Date.now },
//   status: {
//   type: String,
//   enum: ["created", "minted"],
//   default: "created",
// },

// });

// export default mongoose.model("Certificate", certificateSchema);
import mongoose from "mongoose";
const { Schema } = mongoose;

const CertificateSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    studentWallet: {
      type: String,
      required: true
    },

    examId: {
      type: Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true
    },

    contentHash: {
      type: String,
      required: true
    },

    metadataUri: {          // <── PHẢI THÊM FIELD NÀY
      type: String,
      default: null
    },

    txHash: {
      type: String,
      default: null
    },

    tokenId: {              // <── thêm tokenId nếu cần
      type: Number,
      default: null
    },

    contract: {             // <── thêm contract address nếu cần
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["created", "minted"],
      default: "created"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", CertificateSchema);

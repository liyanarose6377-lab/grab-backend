// /backend/models/DepositRequest.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const DepositRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: "TRC20" },
    details: { type: Schema.Types.Mixed }, // stores parsed details JSON (txHash, walletAddress)
    invitationCode: { type: String },
    paymentScreenshot: { type: String }, // filename / relative path to uploads
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepositRequest", DepositRequestSchema);

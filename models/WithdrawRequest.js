// backend/models/WithdrawRequest.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const WithdrawRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },

    walletAddress: { type: String, required: true },

    network: { type: String, enum: ["BEP20", "TRC20"], required: true },

    withdrawPassword: { type: String, required: true },

    invitationCode: { type: String },

    status: { type: String, default: "pending" } // pending/approved/rejected
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", WithdrawRequestSchema);

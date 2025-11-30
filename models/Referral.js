const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReferralSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referredUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commission: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", ReferralSchema);

const mongoose = require("mongoose");
const { Schema } = mongoose;


const TransactionSchema = new mongoose.Schema(
  {
    user: { type:Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    type: String, // deposit/withdraw/service
    status: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);

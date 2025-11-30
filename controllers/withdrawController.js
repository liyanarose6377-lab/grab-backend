// backend/controllers/withdrawController.js
const WithdrawRequest = require("../models/WithdrawRequest");
const User = require("../models/User");

// USER → create withdraw request
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, walletAddress, network, invitationCode, withdrawPassword } = req.body;
    const userId = req.user.id;

    const wr = await WithdrawRequest.create({
      user: userId,
      amount,
      walletAddress,
      network,
      invitationCode,
      withdrawPassword,
      status: "pending",
    });

    res.status(201).json({ success: true, withdraw: wr });
  } catch (err) {
    console.error("requestWithdraw error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN → approve withdraw
exports.approveWithdraw = async (req, res) => {
  try {
    const wr = await WithdrawRequest.findById(req.params.id).populate("user");
    if (!wr) return res.status(404).json({ message: "Not found" });

    const user = wr.user;

    // minus balances
    user.balance -= wr.amount;
    user.totalBalance -= wr.amount;
    await user.save();

    // 🔥 APPROVED → DELETE REQUEST
    await WithdrawRequest.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Withdraw approved and removed from database" });

  } catch (err) {
    console.error("approveWithdraw error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ADMIN → reject withdraw (delete request)
exports.rejectWithdraw = async (req, res) => {
  try {
    const wd = await WithdrawRequest.findById(req.params.id);
    if (!wd) return res.status(404).json({ message: "Not found" });

    await WithdrawRequest.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Withdraw request deleted" });
  } catch (err) {
    console.error("rejectWithdraw error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

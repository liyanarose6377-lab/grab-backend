// backend/routes/withdrawRoutes.js
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  requestWithdraw,
  approveWithdraw,
} = require("../controllers/withdrawController");

const WithdrawRequest = require("../models/WithdrawRequest");

// USER → Create withdraw request
router.post("/request", auth, requestWithdraw);

// ADMIN → Get all withdraws (MUST RETURN ARRAY)
router.get("/all", auth, admin, async (req, res) => {
  try {
    const list = await WithdrawRequest.find()
      .populate("user", "name nickname email invitationCode")
      .sort({ createdAt: -1 });

    return res.json(list); // PURE ARRAY ✔
  } catch (err) {
    console.error("withdraw/all error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ADMIN → Approve withdraw
router.post("/approve/:id", auth, admin, approveWithdraw);

// ADMIN → Reject withdraw (ADDED)
router.post("/reject/:id", auth, admin, async (req, res) => {
  try {
    const wr = await WithdrawRequest.findById(req.params.id);
    if (!wr) return res.status(404).json({ message: "Not found" });

    wr.status = "rejected";
    await wr.save();

    return res.json({ success: true, message: "Withdraw rejected" });
  } catch (err) {
    console.error("withdraw reject err:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

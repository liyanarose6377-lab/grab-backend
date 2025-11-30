const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");

// 👉 Get withdrawal account
router.get("/withdrawal-account", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user.withdrawalAccount
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 👉 Save / update withdrawal account
router.post("/withdrawal-account", auth, async (req, res) => {
  try {
    const { platform, address } = req.body;

    const user = await User.findById(req.user.id);

    user.withdrawalAccount = { platform, address };
    await user.save();

    res.json({
      success: true,
      message: "Withdrawal account saved",
      data: user.withdrawalAccount
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

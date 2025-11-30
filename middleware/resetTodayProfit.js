const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    if (!req.user || !req.user.id) return next();

    const user = await User.findById(req.user.id);
    if (!user) return next();

    const lastReset = user.lastProfitReset || new Date(0);
    const now = new Date();

    const diffHours = (now - lastReset) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      user.todayProfit = 0;
      user.lastProfitReset = now;
      await user.save();
      console.log("Today Profit reset automatically for user:", user._id);
    }

    next();
  } catch (err) {
    console.log("Reset today profit middleware error:", err);
    next();
  }
};

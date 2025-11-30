const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ msg: "No token" });

    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET123");

    // 🔥 IMPORTANT: Load fresh user from DB including isAdmin, role, invitationCode etc.
    const user = await User.findById(decoded.id).select(
      "_id name nickname phone email invitationCode balance isAdmin role"
    );

    if (!user) return res.status(401).json({ msg: "User not found" });

    // Add full user object to req.user
    req.user = {
      id: user._id,
      name: user.name,
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
      invitationCode: user.invitationCode,
      balance: user.balance,
      isAdmin: user.isAdmin,   // ⭐ MOST IMPORTANT
      role: user.role          // ⭐ IMPORTANT
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

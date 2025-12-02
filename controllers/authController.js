const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================
//        SIGNUP
// ==========================
exports.signup = async (req, res) => {
  try {
    const { nickname, phone, loginPassword, withdrawPassword, invitationCode } = req.body;

    // Check required fields
    if (!nickname || !phone || !loginPassword || !withdrawPassword) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Check if phone already exists
    const exists = await User.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // ⭐ Invitation Code is required
    if (!invitationCode || invitationCode.trim() === "") {
      return res.status(400).json({
        message: "Invitation code is required"
      });
    }

    // ⭐ CHECK IF THIS INVITATION CODE ALREADY EXISTS
    if (invitationCode && invitationCode.trim() !== "") {
      const alreadyUsed = await User.findOne({ invitationCode });

      if (alreadyUsed) {
        return res.status(400).json({
          message: "This invitation code is already registered. Try another one."
        });
      }
    }


    // Hash passwords
    const hashedLogin = await bcrypt.hash(loginPassword, 10);
    const hashedWithdraw = await bcrypt.hash(withdrawPassword, 10);

    // Auto-generate invitation code if missing
    const finalInviteCode = invitationCode?.trim() !== ""
      ? invitationCode
      : Math.random().toString(36).slice(2, 8);

    // Create new user
    const newUser = await User.create({
      nickname,
      phone,
      loginPassword: hashedLogin,
      withdrawPassword: hashedWithdraw,
      invitationCode: finalInviteCode
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// ==========================
//          LOGIN
// ==========================
exports.login = async (req, res) => {
  try {
    const { phone, loginPassword } = req.body;

    if (!phone || !loginPassword) {
      return res.status(400).json({ message: "Phone & Password are required" });
    }

    // Check user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const match = await bcrypt.compare(loginPassword, user.loginPassword);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        nickname: user.nickname,
        phone: user.phone,
        invitationCode: user.invitationCode
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// =============================
//   GET LOGGED-IN USER PROFILE
// =============================
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "nickname invitationCode balance totalBalance todayProfit currentOrders totalOrders phone isAdmin role"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        nickname: user.nickname,
        phone: user.phone,
        invitationCode: user.invitationCode,

        // IMPORTANT FIELDS for Profile.tsx
        balance: user.balance || 0,
        totalBalance: user.totalBalance || 0,
        todayProfit: user.todayProfit || 0,
        currentOrders: user.currentOrders || 0,
        totalOrders: user.totalOrders || 0,

        // admin + role also return (future)
        isAdmin: user.isAdmin,
        role: user.role
      }
    });

  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// ================================
//        IMPORTS
// ================================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const orderRoutes = require("./routes/orderRoutes");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const depositRoutes = require("./routes/depositRoutes");
const withdrawRoutes = require("./routes/withdrawRoutes");
const referralRoutes = require("./routes/referralRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const adminRoutes = require("./routes/admin");

// ================================
//        INITIALIZE APP
// ================================
const app = express();

app.use(cors());
app.use(express.json());

// ================================
//   SERVE UPLOADED IMAGES STATICALLY
// ================================
// /uploads/deposits/... (deposit screenshots)
// /uploads/withdraws/... (withdraw screenshots if needed)
// Fix: Ensure uploaded images open in browser (not download)
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});


app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      const lower = filePath.toLowerCase();

      if (lower.endsWith(".png")) res.setHeader("Content-Type", "image/png");
      if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
        res.setHeader("Content-Type", "image/jpeg");
      if (lower.endsWith(".webp")) res.setHeader("Content-Type", "image/webp");
      if (lower.endsWith(".gif")) res.setHeader("Content-Type", "image/gif");

      // MOST IMPORTANT
      res.setHeader("Content-Disposition", "inline");
    },
  })
);

// ================================
//        CONNECT MONGODB
// ================================
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, { dbName: "GrabWebsite" })
  .then(() => console.log("🔥 MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB Error:", err));


// ================================
//        ROUTES
// ================================
app.use("/api/auth", authRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/withdraw", withdrawRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ================================
//   DEFAULT ROUTE (FOR TEST)
// ================================
app.get("/", (req, res) => {
  res.send("Backend API Working 🚀");
});


// ================================
//        START SERVER
// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);

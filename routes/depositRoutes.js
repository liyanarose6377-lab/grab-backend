const router = require("express").Router();
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/deposits");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  requestDeposit,
  listDeposits,
  approveDeposit,
  rejectDeposit,
} = require("../controllers/depositController");

// USER → Create deposit request (with screenshot)
router.post("/request", auth, upload.single("screenshot"), requestDeposit);

// ADMIN → List all (PURE ARRAY RETURN)
router.get("/all", auth, admin, listDeposits);

// ADMIN → Approve deposit
router.post("/approve/:id", auth, admin, approveDeposit);

// ADMIN → Reject deposit
router.post("/reject/:id", auth, admin, rejectDeposit);

module.exports = router;

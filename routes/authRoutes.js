const router = require('express').Router();
const { signup, login, getAllUsers , getMyProfile } = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const resetTodayProfit = require("../middleware/resetTodayProfit");

router.post('/signup', signup);
router.post('/login', login);

// ⭐ USER PROFILE (REAL USER DATA)
router.get('/me', authMiddleware, resetTodayProfit, getMyProfile);

// ⭐ ADMIN ONLY — GET ALL USERS
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;

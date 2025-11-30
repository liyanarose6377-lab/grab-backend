const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getReferrals } = require('../controllers/referralController');
router.get('/', auth, getReferrals);
module.exports = router;

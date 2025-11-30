const Referral = require('../models/Referral');
const User = require('../models/User');

exports.getReferrals = async (req,res) => {
  const userId = req.user.id;
  const referrals = await User.find({ invitedBy: userId }).select('name email createdAt');
  res.json({ referrals });
};

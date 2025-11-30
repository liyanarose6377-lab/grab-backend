const Transaction = require('../models/Transaction');
exports.getTransactions = async (req,res) => {
  const userId = req.user.id;
  const tx = await Transaction.find({ user: userId }).sort({ createdAt:-1 }).limit(100);
  res.json({ transactions: tx });
};

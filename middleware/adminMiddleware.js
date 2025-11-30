module.exports = function (req, res, next) {
  if (req.user && (req.user.role === "admin" || req.user.isAdmin === true)) {
    return next();
  }
  return res.status(403).json({ msg: "Admins only" });
};

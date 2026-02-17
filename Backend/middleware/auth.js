const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/responseHelper");

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "No token provided", 401);

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return error(res, "User not found", 404);

    req.user = user;
    next();
  } catch (err) {
    return error(res, "Invalid token", 401);
  }
}

module.exports = auth;
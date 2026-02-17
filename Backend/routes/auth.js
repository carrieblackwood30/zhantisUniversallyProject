const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");

// POST /api/auth/register
router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return error(res, "All fields are required");

  const existing = await User.findOne({ email }).lean();
  if (existing) return error(res, "Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  return success(res, { id: user._id, email: user.email }, 201);
}));

// POST /api/auth/login
router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return error(res, "Email and password required");

  const user = await User.findOne({ email });
  if (!user) return error(res, "Invalid credentials", 401);

  const match = await bcrypt.compare(password, user.password);
  if (!match) return error(res, "Invalid credentials", 401);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return success(res, { token, user: { id: user._id, name: user.name, email: user.email } });
}));

// GET /api/auth/me
router.get("/me", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return error(res, "No token provided", 401);

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) return error(res, "User not found", 404);

    return success(res, { id: user._id, name: user.name, email: user.email });
  } catch (err) {
    return error(res, "Invalid token", 401);
  }
}));

module.exports = router;
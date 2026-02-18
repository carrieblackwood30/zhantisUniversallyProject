const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/", requireAuth, async (req, res) => {
  const { items, customer } = req.body;

  const order = await Order.create({
    userId: req.user.id,
    items,
    customer,
  });

  res.json(order);
});

router.get("/", requireAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get("/all", requireAuth, requireRole("admin"), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
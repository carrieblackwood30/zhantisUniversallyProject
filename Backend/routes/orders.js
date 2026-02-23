const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { requireAuth, requireRole } = require("../middleware/auth");

// Создание заказа
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, customer, total } = req.body;

    const order = await Order.create({
      userId: req.user.id,   // сохраняем ID пользователя
      customer,
      items,
      total,
      status: "обработка"    // начальная стадия
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Ошибка сохранения заказа:", err);
    res.status(400).json({ error: err.message });
  }
});

// Заказы текущего пользователя
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.product", "name attributes")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Ошибка получения заказов:", err);
    res.status(400).json({ error: err.message });
  }
});

// Все заказы (для админа)
router.get("/all", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product", "name attributes")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Ошибка получения всех заказов:", err);
    res.status(400).json({ error: err.message });
  }
});

// Обновление статуса заказа (для админа)
router.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("items.product", "name attributes");

    if (!order) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json(order);
  } catch (err) {
    console.error("Ошибка обновления статуса заказа:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
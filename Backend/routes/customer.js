const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const auth = require("../middleware/auth"); 

// GET /api/customer
router.get("/", auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.id }).lean();
    res.json(customer || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка загрузки данных клиента" });
  }
});

// POST /api/customer
router.post("/", auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    let customer = await Customer.findOne({ userId: req.user.id });

    if (customer) {
      customer.name = name;
      customer.phone = phone;
      customer.address = address;
      await customer.save();
    } else {
      customer = await Customer.create({ userId: req.user.id, name, phone, address });
    }

    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сохранения данных клиента" });
  }
});

module.exports = router;
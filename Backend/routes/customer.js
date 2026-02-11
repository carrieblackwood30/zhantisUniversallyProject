const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  const customer = await Customer.findOne({ userId: req.user.id });
  res.json(customer || {});
});

router.post("/", requireAuth, async (req, res) => {
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
});

module.exports = router;
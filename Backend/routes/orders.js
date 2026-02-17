const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const validateObjectId = require("../utils/validateObjectId");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");

// GET /api/orders
router.get("/", asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("customer", "name email")
    .populate("products.product", "name price")
    .lean();
  return success(res, orders);
}));

// POST /api/orders
router.post("/", asyncHandler(async (req, res) => {
  const { customer, products, status } = req.body;
  if (!customer || !validateObjectId(customer)) return error(res, "Valid customer id is required");
  if (!Array.isArray(products) || products.length === 0) return error(res, "Products are required");

  // проверка существования клиента
  const cust = await Customer.findById(customer).lean();
  if (!cust) return error(res, "Customer not found");

  // проверка продуктов
  for (const p of products) {
    if (!validateObjectId(p.product)) return error(res, "Invalid product id");
    const prod = await Product.findById(p.product).lean();
    if (!prod) return error(res, `Product not found: ${p.product}`);
  }

  const order = await Order.create({ customer, products, status: status || "pending" });
  return success(res, order, 201);
}));

// PUT /api/orders/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid order id");

  const { status } = req.body;
  const update = {};
  if (status !== undefined) update.status = status;

  const updated = await Order.findByIdAndUpdate(id, update, { new: true })
    .populate("customer", "name email")
    .populate("products.product", "name price")
    .lean();

  if (!updated) return error(res, "Order not found", 404);
  return success(res, updated);
}));

// DELETE /api/orders/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid order id");

  const removed = await Order.findByIdAndDelete(id).lean();
  if (!removed) return error(res, "Order not found", 404);

  return success(res, { ok: true });
}));

module.exports = router;
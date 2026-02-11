const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  color: { type: String } // выбранный цвет, если есть
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Order", orderSchema);
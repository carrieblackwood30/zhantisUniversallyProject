// models/Product.js (фрагмент — добавляем только dynamicAttributes)
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },

  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  subgroup: { type: mongoose.Schema.Types.ObjectId, ref: "Subgroup" },

  price: { type: Number, default: 0 },
  image: { type: String },

  description: { type: String, default: "" },

  attributes: {
    extension: {
      type: String,
      enum: ["полное", "частичное", "фиксаторы"],
      default: null,
    },
    fixation: {
      type: Boolean,
      default: false,
    },
  },

  stock: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
  colors: [String],

  dynamicAttributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
// models/AttributeDefinition.js
const mongoose = require("mongoose");

const AttributeDefinitionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // например, уникальный ключ атрибута
  },
  label: {
    type: String,
    required: true,
  },
  values: {
    type: [String], // список допустимых значений
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
  // Привязка к группе (может быть ObjectId или null)
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  // Привязка к подгруппе (может быть ObjectId или null)
  subgroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subgroup",
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("AttributeDefinition", AttributeDefinitionSchema);
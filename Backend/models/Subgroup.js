// models/Subgroup.js
const mongoose = require("mongoose");

const SubgroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
  // legacy fields for compatibility
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },

  // slug НЕ обязательный
  slug: { type: String, required: false, trim: true, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Subgroup", SubgroupSchema);
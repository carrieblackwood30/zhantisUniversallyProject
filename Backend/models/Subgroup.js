const mongoose = require("mongoose");

const SubgroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
  slug: { type: String, trim: true, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Subgroup", SubgroupSchema);
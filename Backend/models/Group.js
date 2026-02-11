const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, index: true, unique: true, sparse: true },
  attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attribute" }]
}, { timestamps: true });

module.exports = mongoose.model("Group", GroupSchema);
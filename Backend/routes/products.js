const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Group = require("../models/Group");
const Subgroup = require("../models/Subgroup");
const validateObjectId = require("../utils/validateObjectId");

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const { group, subgroup } = req.query;
    const filter = {};

    if (group && validateObjectId(group)) filter.group = group;
    if (subgroup && validateObjectId(subgroup)) filter.subgroup = subgroup;

    const products = await Product.find(filter)
      .populate("group", "name")
      .populate("subgroup", "name")
      .lean()
      .exec();

    res.json(products);
  } catch (err) { next(err); }
});

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const { name, price, group, subgroup, description, colors } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const doc = { name, price, description, colors };

    if (group && validateObjectId(group)) {
      const grp = await Group.findById(group).lean();
      if (!grp) return res.status(400).json({ error: "Group not found" });
      doc.group = group;
    }

    if (subgroup && validateObjectId(subgroup)) {
      const sub = await Subgroup.findById(subgroup).lean();
      if (!sub) return res.status(400).json({ error: "Subgroup not found" });
      doc.subgroup = subgroup;
    }

    const product = await Product.create(doc);
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/products/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) return res.status(400).json({ error: "Invalid product id" });

    const { name, price, group, subgroup, description, colors } = req.body;
    const update = {};

    if (name !== undefined) update.name = name;
    if (price !== undefined) update.price = price;
    if (description !== undefined) update.description = description;
    if (colors !== undefined) update.colors = colors;

    if (group !== undefined) {
      if (group && !validateObjectId(group)) return res.status(400).json({ error: "Invalid group id" });
      update.group = group || null;
    }

    if (subgroup !== undefined) {
      if (subgroup && !validateObjectId(subgroup)) return res.status(400).json({ error: "Invalid subgroup id" });
      update.subgroup = subgroup || null;
    }

    const updated = await Product.findByIdAndUpdate(id, update, { new: true }).lean().exec();
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) return res.status(400).json({ error: "Invalid product id" });

    const removed = await Product.findByIdAndDelete(id).lean().exec();
    if (!removed) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
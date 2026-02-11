// routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 100, search, sort } = req.query;
    const filter = {};

    if (req.query.group) filter.group = req.query.group;
    if (req.query.subgroup) filter.subgroup = req.query.subgroup;
    if (search) filter.name = { $regex: search, $options: "i" };

    const reserved = new Set(["page", "limit", "search", "sort", "group", "subgroup"]);
    Object.keys(req.query).forEach((key) => {
      if (reserved.has(key)) return;
      const raw = req.query[key];
      if (raw.includes(",")) {
        const vals = raw.split(",").map(v => v.trim()).filter(Boolean);
        filter[`attributes.${key}`] = { $in: vals };
      } else if (raw === "true" || raw === "false") {
        filter[`attributes.${key}`] = raw === "true";
      } else {
        filter[`attributes.${key}`] = raw;
      }
    });

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const query = Product.find(filter)
      .populate("group", "name slug")
      .populate("subgroup", "name slug")
      .skip(skip)
      .limit(Number(limit));

    if (sort) query.sort(sort);

    const [items, total] = await Promise.all([query.exec(), Product.countDocuments(filter)]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Товар не найден" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "Товар не найден" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// routes/attributes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AttributeDefinition = require("../models/AttributeDefinition");

// GET /api/attributes?group=&subgroup=&global=true
router.get("/", async (req, res) => {
  try {
    const { group, subgroup, global } = req.query;
    const filter = {};
    if (group) filter.group = group;
    if (subgroup) filter.subgroup = subgroup;
    if (global === "true") { filter.group = null; filter.subgroup = null; }
    const attrs = await AttributeDefinition.find(filter).lean().exec();
    res.json(attrs);
  } catch (err) {
    console.error("GET /api/attributes error:", err.stack || err);
    res.status(500).json({ error: "Ошибка загрузки атрибутов" });
  }
});

// POST /api/attributes
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const a = new AttributeDefinition(body);
    await a.save();
    res.status(201).json(a);
  } catch (err) {
    console.error("POST /api/attributes error:", err.stack || err);
    res.status(500).json({ error: "Ошибка создания атрибута" });
  }
});

// PUT /api/attributes/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    const updated = await AttributeDefinition.findByIdAndUpdate(id, req.body, { new: true }).lean().exec();
    if (!updated) return res.status(404).json({ error: "Attribute not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/attributes/:id error:", err.stack || err);
    res.status(500).json({ error: "Ошибка обновления атрибута" });
  }
});

// DELETE /api/attributes/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });
    await AttributeDefinition.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/attributes/:id error:", err.stack || err);
    res.status(500).json({ error: "Ошибка удаления атрибута" });
  }
});

module.exports = router;
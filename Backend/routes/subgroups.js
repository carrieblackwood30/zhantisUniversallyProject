const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Subgroup = require("../models/Subgroup");
const Group = require("../models/Group");

// GET
router.get("/", async (req, res, next) => {
  try {
    const { parentGroup } = req.query;
    const filter = parentGroup ? { parentGroup } : {};
    const subgroups = await Subgroup.find(filter).lean().exec();
    res.json(subgroups);
  } catch (err) {
    next(err);
  }
});

// POST
router.post("/", async (req, res, next) => {
  try {
    const { name, parentGroup, slug } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    if (parentGroup && !mongoose.Types.ObjectId.isValid(parentGroup)) {
      return res.status(400).json({ error: "Invalid parentGroup id" });
    }

    const doc = { name, parentGroup };
    if (slug) doc.slug = slug.trim();

    const subgroup = await Subgroup.create(doc);
    res.status(201).json(subgroup);
  } catch (err) {
    next(err);
  }
});

// PUT
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const { name, parentGroup, slug } = req.body;
    const update = {};
    if (name) update.name = name;
    if (parentGroup !== undefined) update.parentGroup = parentGroup || null;
    if (slug !== undefined) update.slug = slug ? slug.trim() : null;

    const updated = await Subgroup.findByIdAndUpdate(id, update, { new: true }).lean().exec();
    if (!updated) return res.status(404).json({ error: "Subgroup not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const removed = await Subgroup.findByIdAndDelete(id).lean().exec();
    if (!removed) return res.status(404).json({ error: "Subgroup not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

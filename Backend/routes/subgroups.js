// routes/subgroups.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Subgroup = require("../models/Subgroup");
const Group = require("../models/Group");

// helper: получить parent id из тела запроса
function resolveParentId(body) {
  return body.parentGroup || body.group || body.parent || null;
}

// GET /api/subgroups?parentGroup=ID
router.get("/", async (req, res) => {
  try {
    const { parentGroup, fields } = req.query;
    const filter = {};

    if (parentGroup) {
      if (!mongoose.Types.ObjectId.isValid(parentGroup)) {
        return res.status(400).json({ error: "parentGroup must be a valid id" });
      }
      filter.$or = [
        { parentGroup: parentGroup },
        { group: parentGroup },
        { parent: parentGroup }
      ];
    }

    const select = fields ? String(fields) : "_id name parentGroup group parent slug";
    let query = Subgroup.find(filter).select(select);

    const path = Subgroup.schema.path("parentGroup");
    if (path && path.options && path.options.ref) {
      query = query.populate("parentGroup", "name slug");
    }

    const subgroups = await query.lean().exec();
    return res.json(subgroups);
  } catch (err) {
    console.error("[subgroups] GET error:", err.stack || err);
    return res.status(500).json({ error: "Ошибка загрузки подгрупп" });
  }
});

// POST /api/subgroups
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const parentId = resolveParentId(req.body);
    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ error: "parentGroup must be a valid id" });
    }

    if (parentId) {
      const group = await Group.findById(parentId).lean().exec();
      if (!group) return res.status(400).json({ error: "Parent group not found" });
    }

    const doc = { name };
    if (parentId) {
      doc.parentGroup = parentId;
      doc.group = parentId; // legacy compatibility
      doc.parent = parentId;
    }

    // slug записываем только если явно передали (не автогенерируем)
    if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
      const s = req.body.slug;
      doc.slug = (typeof s === "string" && s.trim() !== "") ? s.trim() : null;
    }

    const subgroup = new Subgroup(doc);
    await subgroup.save();

    const result = await Subgroup.findById(subgroup._id).lean().exec();
    return res.status(201).json(result);
  } catch (err) {
    console.error("[subgroups] POST error:", err.stack || err);
    return res.status(500).json({ error: "Ошибка создания подгруппы" });
  }
});

// PUT /api/subgroups/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid subgroup id" });

    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;

    if (Object.prototype.hasOwnProperty.call(req.body, "parentGroup") ||
        Object.prototype.hasOwnProperty.call(req.body, "group") ||
        Object.prototype.hasOwnProperty.call(req.body, "parent")) {
      const parentId = resolveParentId(req.body);
      if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ error: "parentGroup must be a valid id" });
      }
      update.parentGroup = parentId || null;
      update.group = parentId || null;
      update.parent = parentId || null;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "slug")) {
      const s = req.body.slug;
      update.slug = (typeof s === "string" && s.trim() !== "") ? s.trim() : null;
    }

    const updated = await Subgroup.findByIdAndUpdate(id, update, { new: true }).lean().exec();
    if (!updated) return res.status(404).json({ error: "Subgroup not found" });
    return res.json(updated);
  } catch (err) {
    console.error("[subgroups] PUT error:", err.stack || err);
    return res.status(500).json({ error: "Ошибка обновления подгруппы" });
  }
});

// DELETE /api/subgroups/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid subgroup id" });

    const removed = await Subgroup.findByIdAndDelete(id).lean().exec();
    if (!removed) return res.status(404).json({ error: "Subgroup not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[subgroups] DELETE error:", err.stack || err);
    return res.status(500).json({ error: "Ошибка удаления подгруппы" });
  }
});

module.exports = router;
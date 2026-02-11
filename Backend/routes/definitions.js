// routes/definitions.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const AttributeDefinition = require("../models/AttributeDefinition");
const Subgroup = require("../models/Subgroup");
const Group = require("../models/Group");

router.put("/bulk", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { attributes = [], subgroups = [], groups = [] } = req.body;

    const results = { attributes: [], subgroups: [], groups: [] };

    // Обновляем/создаём атрибуты
    for (const a of attributes) {
      if (a._id) {
        const updated = await AttributeDefinition.findByIdAndUpdate(a._id, a, { new: true, session });
        results.attributes.push(updated);
      } else {
        const created = await AttributeDefinition.create([a], { session });
        results.attributes.push(created[0]);
      }
    }

    // Обновляем/создаём подгруппы
    for (const s of subgroups) {
      if (s._id) {
        const updated = await Subgroup.findByIdAndUpdate(s._id, s, { new: true, session });
        results.subgroups.push(updated);
      } else {
        const created = await Subgroup.create([s], { session });
        results.subgroups.push(created[0]);
      }
    }

    // Аналогично для групп (если нужно)
    for (const g of groups) {
      if (g._id) {
        const updated = await Group.findByIdAndUpdate(g._id, g, { new: true, session });
        results.groups.push(updated);
      } else {
        const created = await Group.create([g], { session });
        results.groups.push(created[0]);
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, results });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("bulk definitions error", err);
    res.status(500).json({ error: "Ошибка bulk сохранения" });
  }
});

module.exports = router;
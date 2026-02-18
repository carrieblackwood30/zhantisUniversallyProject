// routes/groups.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Group = require("../models/Group");

// Получить все группы (lean + проекция)
router.get("/", async (req, res) => {
  try {
    // можно добавить ?fields=name,_id чтобы отдавать только нужные поля
    const groups = await Group.find().select("_id name slug").lean().exec();
    res.json(groups);
  } catch (err) {
    console.error("GET /api/groups error", err);
    res.status(500).json({ error: "Ошибка загрузки групп" });
  }
});

// Добавить группу
router.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const group = new Group({ name, slug });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("POST /api/groups error", err);
    res.status(500).json({ error: "Ошибка добавления группы" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, slug } = req.body;
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { name, slug },
      { new: true }
    ).lean().exec();
    if (!group) return res.status(404).json({ error: "Группа не найдена" });
    res.json(group);
  } catch (err) {
    console.error("PUT /api/groups/:id error", err);
    res.status(500).json({ error: "Ошибка обновления группы" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id).lean().exec();
    if (!group) return res.status(404).json({ error: "Группа не найдена" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/groups/:id error", err);
    res.status(500).json({ error: "Ошибка удаления группы" });
  }
});

// Bulk update/create groups — быстрее для массовых изменений
router.put("/bulk", async (req, res) => {
  const items = Array.isArray(req.body.groups) ? req.body.groups : [];
  if (!items.length) return res.json({ ok: true, result: "no items" });

  const ops = items.map(g => {
    if (g._id) {
      return {
        updateOne: {
          filter: { _id: mongoose.Types.ObjectId(g._id) },
          update: { $set: { name: g.name, slug: g.slug } },
          upsert: false
        }
      };
    } else {
      return {
        insertOne: {
          document: { name: g.name, slug: g.slug }
        }
      };
    }
  });

  try {
    const result = await Group.bulkWrite(ops, { ordered: false });
    res.json({ ok: true, result });
  } catch (err) {
    console.error("PUT /api/groups/bulk error", err);
    res.status(500).json({ error: "Ошибка bulk сохранения групп" });
  }
});

module.exports = router;
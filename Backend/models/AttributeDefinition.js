const express = require("express");
const router = express.Router();
const AttributeDefinition = require("../models/AttributeDefinition");

// GET /api/attribute-definitions?group=...&subgroup=...
router.get("/", async (req, res) => {
  try {
    const { group, subgroup } = req.query;

    // 1) сначала атрибуты, привязанные к подгруппе
    let attrs = [];
    if (subgroup) {
      attrs = await AttributeDefinition.find({ subgroup }).lean().exec();
    }

    // 2) затем атрибуты группы (если не перекрыты)
    if (group) {
      const groupAttrs = await AttributeDefinition.find({ group }).lean().exec();
      // merge: если ключ уже есть — не добавляем дубликат
      const existingKeys = new Set(attrs.map(a => a.key));
      for (const a of groupAttrs) if (!existingKeys.has(a.key)) attrs.push(a);
    }

    // 3) глобальные (group == null && subgroup == null)
    const globalAttrs = await AttributeDefinition.find({ group: null, subgroup: null }).lean().exec();
    const existingKeys = new Set(attrs.map(a => a.key));
    for (const a of globalAttrs) if (!existingKeys.has(a.key)) attrs.push(a);

    // сортировка по order
    attrs.sort((a,b) => (a.order||0) - (b.order||0));

    res.json(attrs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка загрузки определений атрибутов" });
  }
});

module.exports = router;
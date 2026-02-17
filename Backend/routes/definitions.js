const express = require("express");
const router = express.Router();
const AttributeDefinition = require("../models/AttributeDefinition");
const validateObjectId = require("../utils/validateObjectId");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");

// GET /api/attribute-definitions?group=...&subgroup=...
router.get("/", asyncHandler(async (req, res) => {
  const { group, subgroup } = req.query;

  let attrs = [];

  // 1) атрибуты подгруппы
  if (subgroup && validateObjectId(subgroup)) {
    attrs = await AttributeDefinition.find({ subgroup }).lean();
  }

  // 2) атрибуты группы (без дубликатов)
  if (group && validateObjectId(group)) {
    const groupAttrs = await AttributeDefinition.find({ group }).lean();
    const existingKeys = new Set(attrs.map(a => a.key));
    for (const a of groupAttrs) if (!existingKeys.has(a.key)) attrs.push(a);
  }

  // 3) глобальные атрибуты
  const globalAttrs = await AttributeDefinition.find({ group: null, subgroup: null }).lean();
  const existingKeys = new Set(attrs.map(a => a.key));
  for (const a of globalAttrs) if (!existingKeys.has(a.key)) attrs.push(a);

  // сортировка
  attrs.sort((a, b) => (a.order || 0) - (b.order || 0));

  return success(res, attrs);
}));

module.exports = router;
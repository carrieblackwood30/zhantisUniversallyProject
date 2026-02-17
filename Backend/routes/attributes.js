const express = require("express");
const router = express.Router();
const AttributeDefinition = require("../models/AttributeDefinition");
const Group = require("../models/Group");
const Subgroup = require("../models/Subgroup");
const validateObjectId = require("../utils/validateObjectId");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");

// GET /api/attributes
router.get("/", asyncHandler(async (req, res) => {
  const { group, subgroup, global } = req.query;
  let attrs = [];

  if (subgroup && validateObjectId(subgroup)) {
    attrs = await AttributeDefinition.find({ subgroup }).lean();
  }

  if (group && validateObjectId(group)) {
    const groupAttrs = await AttributeDefinition.find({ group }).lean();
    const existingKeys = new Set(attrs.map(a => a.key));
    for (const a of groupAttrs) if (!existingKeys.has(a.key)) attrs.push(a);
  }

  if (global) {
    const globalAttrs = await AttributeDefinition.find({ group: null, subgroup: null }).lean();
    const existingKeys = new Set(attrs.map(a => a.key));
    for (const a of globalAttrs) if (!existingKeys.has(a.key)) attrs.push(a);
  }

  attrs.sort((a, b) => (a.order || 0) - (b.order || 0));
  return success(res, attrs);
}));

// POST /api/attributes
router.post("/", asyncHandler(async (req, res) => {
  const { key, label, group, subgroup, global } = req.body;
  if (!key) return error(res, "key is required");
  if (!label) return error(res, "label is required");

  const doc = { key, label, global: !!global };

  if (group && validateObjectId(group)) {
    const grp = await Group.findById(group).lean();
    if (!grp) return error(res, "Group not found");
    doc.group = group;
  }

  if (subgroup && validateObjectId(subgroup)) {
    const sub = await Subgroup.findById(subgroup).lean();
    if (!sub) return error(res, "Subgroup not found");
    doc.subgroup = subgroup;
  }

  const attribute = await AttributeDefinition.create(doc);
  return success(res, attribute, 201);
}));

// PUT /api/attributes/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid attribute id");

  const { key, label, group, subgroup, global } = req.body;
  const update = {};
  if (key !== undefined) update.key = key;
  if (label !== undefined) update.label = label;
  if (global !== undefined) update.global = !!global;

  if (group !== undefined) {
    if (group && !validateObjectId(group)) return error(res, "Invalid group id");
    update.group = group || null;
  }

  if (subgroup !== undefined) {
    if (subgroup && !validateObjectId(subgroup)) return error(res, "Invalid subgroup id");
    update.subgroup = subgroup || null;
  }

  const updated = await AttributeDefinition.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!updated) return error(res, "Attribute not found", 404);

  return success(res, updated);
}));

// DELETE /api/attributes/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid attribute id");

  const removed = await AttributeDefinition.findByIdAndDelete(id).lean();
  if (!removed) return error(res, "Attribute not found", 404);

  return success(res, { ok: true });
}));

module.exports = router;
const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const validateObjectId = require("../utils/validateObjectId");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");

// GET /api/groups
router.get("/", asyncHandler(async (req, res) => {
  const groups = await Group.find().lean();
  return success(res, groups);
}));

// POST /api/groups
router.post("/", asyncHandler(async (req, res) => {
  const { name, slug } = req.body;
  if (!name) return error(res, "name is required");

  const doc = { name };
  if (slug) doc.slug = slug.trim();

  const group = await Group.create(doc);
  return success(res, group, 201);
}));

// PUT /api/groups/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid group id");

  const { name, slug } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (slug !== undefined) update.slug = slug ? slug.trim() : null;

  const updated = await Group.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!updated) return error(res, "Group not found", 404);

  return success(res, updated);
}));

// DELETE /api/groups/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateObjectId(id)) return error(res, "Invalid group id");

  const removed = await Group.findByIdAndDelete(id).lean();
  if (!removed) return error(res, "Group not found", 404);

  return success(res, { ok: true });
}));

module.exports = router;
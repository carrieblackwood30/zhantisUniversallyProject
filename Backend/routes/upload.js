const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");
const { success, error } = require("../utils/responseHelper");
const auth = require("../middleware/auth"); // защита загрузки

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Фильтр типов файлов
function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
}

const upload = multer({ storage, fileFilter });

// POST /api/upload
router.post("/", auth, upload.single("file"), asyncHandler(async (req, res) => {
  if (!req.file) return error(res, "No file uploaded");
  const fileUrl = `/uploads/${req.file.filename}`;
  return success(res, { url: fileUrl }, 201);
}));

module.exports = router;
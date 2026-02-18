const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Роут для загрузки одного файла
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }
  // Возвращаем путь к файлу, который можно использовать во фронтенде
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

module.exports = router;

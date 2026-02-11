// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "please_set_a_real_secret_in_env";

// Вспомог: генерация токенов
function createTokens(user) {
  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
}

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // обязательные поля: email + password
    if (!email || !password) {
      return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    // создаём пользователя (Mongoose проверит уникальность)
    const user = new User({ name, username, email, password });

    try {
      await user.save();
    } catch (saveErr) {
      // обработка ошибок уникальности (duplicate key)
      if (saveErr && saveErr.code === 11000) {
        // выясняем, какое поле вызвало конфликт
        const dupField = Object.keys(saveErr.keyPattern || {})[0] || "email";
        return res.status(409).json({ error: dupField === "email" ? "Такой email уже существует" : "Такой username уже существует" });
      }
      throw saveErr;
    }

    const { accessToken, refreshToken } = createTokens(user);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ error: "Ошибка сервера при регистрации" });
  }
});

// Логин
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email и пароль обязательны" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Пользователь не найден" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Неверный пароль" });

    const { accessToken, refreshToken } = createTokens(user);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ error: "Ошибка сервера при входе" });
  }
});

// Обновление accessToken
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Ошибка обновления токена:", err);
    res.status(403).json({ error: "Неверный refresh token" });
  }
});

module.exports = router;
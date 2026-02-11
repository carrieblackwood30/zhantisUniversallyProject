// models/User.js
const mongoose = require("../db");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    // Отображаемое имя (необязательно)
    name: { type: String, trim: true, default: "" },

    // Уникальный логин/никнейм (необязательно, генерируется если не передан)
    username: { type: String, unique: true, sparse: true, trim: true },

    // Email для входа (обязательно)
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Хэшированный пароль (обязательно)
    password: { type: String, required: true },

    // Роль
    role: { type: String, enum: ["admin", "customer"], default: "customer" }
  },
  { timestamps: true }
);

// Генерация username по email, если не передан
UserSchema.pre("validate", async function (next) {
  if (!this.username && this.email) {
    const local = this.email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 20);
    let candidate = local;
    let i = 0;
    // пробуем уникальный username (макс 10 попыток)
    while (i < 10) {
      // добавляем суффикс если нужно
      const tryName = i === 0 ? candidate : `${candidate}${Math.floor(Math.random() * 900) + 100}`;
      // проверка существования
      // используем модель напрямую, но без await в цикле — тут допустимо
      // NOTE: если коллекция большая, можно оптимизировать
      // eslint-disable-next-line no-await-in-loop
      const exists = await mongoose.models.User.findOne({ username: tryName }).lean().exec();
      if (!exists) {
        this.username = tryName;
        break;
      }
      i++;
    }
    if (!this.username) {
      // как fallback — использовать id после сохранения (mongoose присвоит _id)
      this.username = `${local}${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

// Хэшируем пароль перед сохранением
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Метод для сравнения паролей
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
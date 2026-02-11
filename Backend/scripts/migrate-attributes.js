// scripts/migrate-attributes.js
const mongoose = require("mongoose");
require("dotenv").config();
const AttributeDefinition = require("../models/AttributeDefinition");
const oldModel = require("../models/AttributeDefinition"); // если имя файла совпадает, адаптируй

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  const all = await AttributeDefinition.find().lean();
  for (const a of all) {
    // если values — массив строк, преобразуем
    if (Array.isArray(a.values) && a.values.length && typeof a.values[0] === "string") {
      const newValues = a.values.map(v => ({ value: v, label: v, meta: {} }));
      await AttributeDefinition.updateOne({ _id: a._id }, { $set: { values: newValues } });
      console.log("Migrated attribute", a.key);
    }
  }

  // Пример: создать определение для extension, если его нет
  const ext = await AttributeDefinition.findOne({ key: "extension" });
  if (!ext) {
    await AttributeDefinition.create({
      key: "extension",
      label: "Тип выдвижения",
      type: "enum",
      values: [
        { value: "полное", label: "полное" },
        { value: "частичное", label: "частичное" },
        { value: "фиксаторы", label: "фиксаторы" }
      ],
      group: null
    });
    console.log("Created extension attribute definition");
  }

  // Пример: создать атрибут color, если есть продукты с colors
  const Product = require("../models/Product");
  const sample = await Product.findOne({ colors: { $exists: true, $ne: [] } }).lean();
  if (sample) {
    const colorDef = await AttributeDefinition.findOne({ key: "color" });
    if (!colorDef) {
      // собираем уникальные цвета из всех продуктов (ограниченно)
      const colors = await Product.distinct("colors");
      const values = colors.map(c => ({ value: c, label: c, meta: {} }));
      await AttributeDefinition.create({
        key: "color",
        label: "Цвет",
        type: "enum",
        values,
        group: null
      });
      console.log("Created color attribute definition");
    }
  }

  mongoose.disconnect();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
// src/composables/aventos/hk.js
import { hkKitEuro, checkLimits, calculateMechanismCount } from "./shared";

export function calculateHK(params) {
  const pf = Number(params.pf);
  const width = Number(params.widthMm);
  const height = Math.ceil(Number(params.heightMm));
  const weightKg = Number(params.weightKg);

  const limits = { minHeight: 300, maxHeight: 600, maxWidth: 1800 };
  const limitCheck = checkLimits(width, height, limits, "HK top");
  if (limitCheck) return limitCheck;

  if (!isFinite(weightKg) || !isFinite(pf)) {
    return { outOfRange: true, message: `Некорректные входные данные для HK.` };
  }

  const candidates = hkKitEuro
    .map(row => {
      const kitCapacity = Number(row.maxLF);
      const singleCapacity = kitCapacity / 2;
      const requiredCount = calculateMechanismCount(pf, singleCapacity, kitCapacity, 4);
      return { ...row, kitCapacity, singleCapacity, requiredCount };
    })
    .filter(c => c.requiredCount !== null);

  if (!candidates.length) {
    return { outOfRange: true, message: `PF = ${pf.toFixed(2)} не попадает в диапазоны комплектов HK.` };
  }

  candidates.sort((a, b) => {
    if (a.requiredCount !== b.requiredCount) return a.requiredCount - b.requiredCount;
    return a.kitCapacity - b.kitCapacity;
  });

  const chosen = candidates[0];

  // Начальное количество механизмов из каталога
  let mechanismCount = chosen.requiredCount;

  // Правило для HK: комплекты поставляются парами — минимум 2 силовика
  mechanismCount = Math.max(2, mechanismCount);

  // Если 2 и вес > 18 кг — увеличить (консервативно)
  if (mechanismCount === 2 && weightKg > 18) {
    mechanismCount = Math.min(4, mechanismCount + 1);
  }

  // Если PF близок к верхней границе комплекта (>90%) — добавить +1
  if (pf > 0.9 * chosen.kitCapacity && mechanismCount < 4) {
    mechanismCount = Math.min(4, mechanismCount + 1);
  }

  // Формируем массив артикулов силовиков (повторяем артикул комплекта mechanismCount раз)
  const mechanismArticles = Array.from({ length: mechanismCount }, () => chosen.article);

  const needsAdditionalMechanism = chosen.requiredCount !== mechanismCount;
  const recommendation = `Рекомендуется установить ${mechanismCount} механизма(ов) ${chosen.article}.`;

  // Возвращаем только релевантные поля для HK (без петель, без рычагов)
  return {
    typeKey: "HK_top",
    pf: Number(pf.toFixed(2)),
    mechanism: { code: "HK", article: chosen.article, name: chosen.note ?? "HK top" },
    mechanismCount,
    mechanismArticles,
    recommendation,
    approx: false,
    needsAdditionalMechanism
  };
}
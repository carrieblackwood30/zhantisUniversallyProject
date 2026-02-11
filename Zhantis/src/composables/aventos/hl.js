// src/composables/aventos/hl.js
import {
  hlMechanismCatalogue,
  checkLimits,
  calculateMechanismCount
} from "./shared";

/**
 * calculateHL(params)
 * params: { pf, widthMm, heightMm, thicknessMm, material, weightKg }
 *
 * Возвращает минимально необходимое количество силовиков и массив артикулов.
 */
export function calculateHL(params) {
  const pf = Number(params.pf);
  const width = Number(params.widthMm);
  const height = Math.ceil(Number(params.heightMm));
  const weightKg = Number(params.weightKg);

  const limits = { minHeight: 300, maxHeight: 580, maxWidth: 1800 };
  const limitCheck = checkLimits(width, height, limits, "HL top");
  if (limitCheck) return limitCheck;

  if (!isFinite(weightKg) || !isFinite(pf)) {
    return { outOfRange: true, message: `Некорректные входные данные для HL.` };
  }

  // candidates: используем kitPower как kitCapacity
  const candidates = hlMechanismCatalogue
    .map(row => {
      const kitCapacity = Number(row.kitPower);
      const singleCapacity = kitCapacity / 2;
      const requiredCount = calculateMechanismCount(pf, singleCapacity, kitCapacity, 4);
      return { ...row, kitCapacity, singleCapacity, requiredCount };
    })
    .filter(c => c.requiredCount !== null);

  if (!candidates.length) {
    return { outOfRange: true, message: `PF = ${pf.toFixed(2)} не попадает в диапазоны комплектов HL.` };
  }

  // Выбираем кандидат с минимальным requiredCount; при равенстве — меньший kitCapacity
  candidates.sort((a, b) => {
    if (a.requiredCount !== b.requiredCount) return a.requiredCount - b.requiredCount;
    return a.kitCapacity - b.kitCapacity;
  });

  const chosen = candidates[0];

  let mechanismCount = chosen.requiredCount;

  // Консервативная корректировка: если PF близко к верхней границе (>90%), добавляем +1
  if (pf > 0.9 * chosen.kitCapacity && mechanismCount < 4) {
    mechanismCount = Math.min(4, mechanismCount + 1);
  }

  // Формируем массив артикулов силовиков
  const mechanismArticles = Array.from({ length: mechanismCount }, () => chosen.article);

  // Доп. оборудование: валы и соединитель
  let shafts = 0;
  let connector = false;
  if (mechanismCount >= 4) {
    shafts = 2; connector = true;
  } else if (mechanismCount === 3) {
    shafts = width > 1500 ? 2 : 1; connector = true;
  } else {
    if (width > 1500) { shafts = 2; connector = true; }
    else if (width > 1200) { shafts = 1; connector = true; }
  }

  let needsAdditionalMechanism = false;
  if (width > 1200) {
    shafts = 2;
    connector = true;
    needsAdditionalMechanism = true;
  }

  const recommendation = `Рекомендуется установить ${mechanismCount} механизма(ов) ${chosen.article}.`;

  return {
    typeKey: "HL_top",
    pf: Number(pf.toFixed(2)),
    mechanism: { code: "HL", article: chosen.article, name: "HL top" },
    mechanismCount,
    mechanismArticles,
    recommendation,
    approx: false,
    needsAdditionalMechanism,
    additionalHardware: { shafts, connector }
  };
}
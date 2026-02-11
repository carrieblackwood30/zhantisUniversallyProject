// src/composables/aventos/hs.js
import { checkLimits, hsCatalogue, calculateMechanismCount, calcHingesCount } from "./shared";

/**
 * params: { pf, widthMm, heightMm, thicknessMm, material, weightKg }
 */
export function calculateHS(params) {
  const pf = Number(params.pf);
  const width = Number(params.widthMm);
  const height = Math.ceil(Number(params.heightMm));
  const weightKg = Number(params.weightKg);

  const limits = { minHeight: 350, maxHeight: 800, maxWidth: 1800 };
  const limitCheck = checkLimits(width, height, limits, "HS top");
  if (limitCheck) return limitCheck;

  if (!isFinite(weightKg)) {
    return { outOfRange: true, message: `Не удалось рассчитать вес фасада для HS.` };
  }

  // 1) Строгий поиск: height + weight
  const strictCandidates = hsCatalogue
    .filter(row => height >= row.minH && height <= row.maxH && weightKg >= row.minW && weightKg <= row.maxW)
    .map(row => {
      const kitPower = Number(row.kitPower);
      const singleCapacity = kitPower / 2;
      const requiredCount = calculateMechanismCount(pf, singleCapacity, kitPower, 4);
      return { ...row, kitPower, singleCapacity, requiredCount, approx: false };
    })
    .filter(c => c.requiredCount !== null);

  if (strictCandidates.length) {
    strictCandidates.sort((a, b) => {
      if (a.requiredCount !== b.requiredCount) return a.requiredCount - b.requiredCount;
      return a.kitPower - b.kitPower;
    });
    const chosen = strictCandidates[0];
    const mechanismCount = chosen.requiredCount;

    const recommendation = mechanismCount === 1
      ? `Достаточно одного комплекта HS (${chosen.article}).`
      : `Для PF = ${pf.toFixed(2)} рекомендуется установить ${mechanismCount} комплекта(ов) HS (${chosen.article}).`;

    return {
      typeKey: "HS_top",
      pf: Number(pf.toFixed(2)),
      mechanism: { code: "HS", article: chosen.article, name: "HS top" },
      mechanismCount,
      requiredCount: mechanismCount,
      requiredLevers: 0,
      levers: [],
      leversArticles: [],
      hingesCount: calcHingesCount(width),
      effHeight: height,
      weightKg,
      weight: weightKg,
      recommendation
    };
  }

  // 2) Relaxed поиск: по высоте только (approx). Попробуем подобрать комплект по высоте и оценить requiredCount.
  const heightCandidates = hsCatalogue
    .filter(row => height >= row.minH && height <= row.maxH)
    .map(row => {
      const kitPower = Number(row.kitPower);
      const singleCapacity = kitPower / 2;
      const requiredCount = calculateMechanismCount(pf, singleCapacity, kitPower, 4);
      return { ...row, kitPower, singleCapacity, requiredCount, approx: true };
    })
    .filter(c => c.requiredCount !== null);

  if (heightCandidates.length) {
    heightCandidates.sort((a, b) => {
      if (a.requiredCount !== b.requiredCount) return a.requiredCount - b.requiredCount;
      return a.kitPower - b.kitPower;
    });
    const chosen = heightCandidates[0];
    const mechanismCount = chosen.requiredCount;

    const recommendation = mechanismCount === 1
      ? `Найден комплект HS (${chosen.article}) по высоте, но вес (${weightKg.toFixed(2)} кг) выходит за штатный диапазон. Требуется согласование.`
      : `Найден комплект HS (${chosen.article}) по высоте; для PF = ${pf.toFixed(2)} потребуется ${mechanismCount} комплекта(ов) HS (${chosen.article}). Вес (${weightKg.toFixed(2)} кг) вне штатного диапазона — требуется согласование/усиление.`;

    return {
      typeKey: "HS_top",
      pf: Number(pf.toFixed(2)),
      mechanism: { code: "HS", article: chosen.article, name: "HS top" },
      mechanismCount,
      requiredCount: mechanismCount,
      requiredLevers: 0,
      levers: [],
      leversArticles: [],
      hingesCount: calcHingesCount(width),
      effHeight: height,
      weightKg,
      weight: weightKg,
      recommendation,
      approx: true,
      needsAdditionalMechanism: true
    };
  }

  return { outOfRange: true, message: `Для H=${height} мм нет подходящего комплекта HS для веса ${weightKg.toFixed(2)} кг. Попробуйте другую серию или измените параметры.` };
}
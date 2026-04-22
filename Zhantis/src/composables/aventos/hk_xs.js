// src/composables/aventos/hk_xs.js
import { checkLimits } from "./shared.js";

export const hkXsLimits = { maxHeight: 600 };

export const hkXsCatalogue = {
  BLUMOTION: {
    11: { min: 200, max: 1000, article: "20K11BL" },
    13: { min: 500, max: 1500, article: "20K13BL" },
    15: { min: 800, max: 1800, article: "20K15BL" }
  },
  TIPON: {
    11: { min: 180, max: 800, article: "20K11TIP" },
    13: { min: 500, max: 1200, article: "20K13TIP" },
    15: { min: 800, max: 1600, article: "20K15TIP" }
  }
};

export function calculateHKXS(params) {
  const pf = Number(params.pf);
  const width = Number(params.widthMm);
  const height = Math.ceil(Number(params.heightMm));
  const weightKg = Number(params.weightKg);

  const limitCheck = checkLimits(width, height, hkXsLimits, "HK-XS");
  if (limitCheck) return limitCheck;

  if (!isFinite(weightKg) || !isFinite(pf)) {
    return { outOfRange: true, message: "Некорректные входные данные для HK-XS." };
  }

  const catalogue = hkXsCatalogue[params.subType];
  if (!catalogue) {
    return { outOfRange: true, message: `Неизвестный тип HK-XS: ${params.subType}` };
  }

  let chosen = null;
  let mechanismCount = 1;

  // 1. Сначала ищем одиночный силовик
  for (const [size, { min, max, article }] of Object.entries(catalogue)) {
    if (pf >= min && pf <= max) {
      chosen = { size, article };
      mechanismCount = 1;
      break;
    }
  }

  // 2. Если одиночный не найден, проверяем удвоенный диапазон
  if (!chosen) {
    for (const [size, { min, max, article }] of Object.entries(catalogue)) {
      if (pf > max && pf <= max * 2) {
        chosen = { size, article };
        mechanismCount = 2;
        break;
      }
    }
  }

  if (!chosen) {
    return { outOfRange: true, message: `PF = ${pf.toFixed(2)} не попадает в диапазоны HK-XS.` };
  }

  const mechanismArticles = Array.from({ length: mechanismCount }, () => chosen.article);
  const recommendation =
    mechanismCount === 1
      ? `Рекомендуется установить 1 силовик HK-XS ${chosen.size} (${chosen.article}).`
      : `Рекомендуется установить ${mechanismCount} силовика HK-XS ${chosen.size} (${chosen.article}).`;

  return {
    typeKey: "HK_xs",
    pf: Number(pf.toFixed(2)),
    mechanism: { code: "HK-XS", article: chosen.article, name: `HK-XS ${chosen.size}` },
    mechanismCount,
    mechanismArticles,
    recommendation,
    approx: false,
    needsAdditionalMechanism: false
  };
}
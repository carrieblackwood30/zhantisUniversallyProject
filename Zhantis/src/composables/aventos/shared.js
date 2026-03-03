// src/composables/aventos/shared.js

export const materials = {
  "МДФ": 700,
  "ЛДСП": 650
};

export function calcWeightKg(widthMm, heightMm, thicknessMm, materialKey) {
  const density = materials[materialKey] ?? 700; // kg/m3
  const w = Number(widthMm) / 1000;
  const h = Number(heightMm) / 1000;
  const t = Number(thicknessMm) / 1000;
  if (![w, h, t].every(isFinite) || w <= 0 || h <= 0 || t <= 0) return NaN;
  return w * h * t * density;
}

/**
 * Проверка габаритов для серии.
 * limits: { minHeight, maxHeight, maxWidth }
 */
export function checkLimits(widthMm, heightMm, limits, typeKey) {
  const width = Number(widthMm);
  const height = Number(heightMm);
  if (!isFinite(width) || !isFinite(height)) {
    return { outOfRange: true, message: `Некорректные размеры для ${typeKey}.` };
  }
  if (limits?.minHeight && height < limits.minHeight) {
    return { outOfRange: true, message: `Высота ${height} мм меньше минимальной для ${typeKey} (${limits.minHeight} мм).`, minHeight: limits.minHeight, maxHeight: limits.maxHeight };
  }
  if (limits?.maxHeight && height > limits.maxHeight) {
    return { outOfRange: true, message: `Высота ${height} мм больше максимальной для ${typeKey} (${limits.maxHeight} мм).`, minHeight: limits.minHeight, maxHeight: limits.maxHeight };
  }
  if (limits?.maxWidth && width > limits.maxWidth) {
    return { outOfRange: true, message: `Ширина ${width} мм превышает максимум для ${typeKey} (${limits.maxWidth} мм).` };
  }
  return null;
}

/**
 * Детеминированная функция подсчёта количества механизмов.
 * pf и capacities в одних единицах (kg·mm).
 * Возвращает 1..4 или null если не покрывается.
 */
export function calculateMechanismCount(pf, singleCapacity, kitCapacity, maxMechanisms = 4) {
  if (![pf, singleCapacity, kitCapacity].every(v => isFinite(v))) return null;
  const eps = 1e-6;

  if (pf <= singleCapacity + eps) return 1;
  if (pf <= kitCapacity + eps) return 2;
  if (pf <= kitCapacity * 1.5 + eps) return 3;
  if (maxMechanisms >= 4 && pf <= kitCapacity * 2 + eps) return 4;
  return null;
}

/* HF: комплекты и артикула рычагов по numeric lever (35/39) */
export const hfKitLF = {
  "HF-25": {
    kit: 13500, // единицы PF (kg·mm)
    article: "22F2510",
    name: "HF top 25N",
    leverArticles: { "35": "22F3500", "39": "22F3900" }
  },
  "HF-28": {
    kit: 19300,
    article: "22F2810",
    name: "HF top 28N",
    leverArticles: { "35": "22F3500", "39": "22F3900" }
  }
};

/* HS: каталог — диапазоны высот и весов (в кг) и артикулы */
export const hsCatalogue = [
  { minH: 350, maxH: 450, minW: 2.0,  maxW: 11.5, article: "22S2210", kitPower: 8000  },
  { minH: 450, maxH: 540, minW: 2.5,  maxW: 12.5, article: "22S2510", kitPower: 12000 },
  { minH: 480, maxH: 660, minW: 2.75, maxW: 15.25, article: "22S2810", kitPower: 16000 },
  { minH: 650, maxH: 800, minW: 3.5,  maxW: 18.5, article: "22S2810", kitPower: 16000 }
];

export function getHSArticleAndPower(heightMm, weightKg) {
  const h = Number(heightMm);
  const w = Number(weightKg);
  if (!isFinite(h) || !isFinite(w)) return null;
  for (const row of hsCatalogue) {
    if (h >= row.minH && h <= row.maxH && w >= row.minW && w <= row.maxW) {
      return { article: row.article, kitPower: row.kitPower };
    }
  }
  return null;
}

/* HL: механизмы и рычаги */
export const hlMechanismCatalogue = [
  { minKH: 300, maxKH: 389, article: "22L2200", kitPower: 9000 },
  { minKH: 390, maxKH: 580, article: "22L2500", kitPower: 12500 }
];

export const hlLeverCatalogue = [
  { minKH: 300, maxKH: 339, minFG: 1.50, maxFG: 9.00,  article: "22L3200" },
  { minKH: 340, maxKH: 389, minFG: 1.75, maxFG: 10.00, article: "22L3500" },
  { minKH: 390, maxKH: 540, minFG: 2.00, maxFG: 12.25, article: "22L3800" },
  { minKH: 480, maxKH: 580, minFG: 2.50, maxFG: 14.00, article: "22L3900" }
];

export function getHLMechanismByHeight(khMm) {
  const h = Number(khMm);
  if (!isFinite(h)) return null;
  for (const row of hlMechanismCatalogue) {
    if (h >= row.minKH && h <= row.maxKH) return { article: row.article, kitPower: row.kitPower };
  }
  return null;
}

export const hkKitEuro = [
  { minLF: 420,  maxLF: 1610, article: "22K2310", note: "23 силовик" },
  { minLF: 930,  maxLF: 2800, article: "22K2510", note: "25 силовик" },
  { minLF: 1730, maxLF: 5200, article: "22K2710", note: "27 силовик" },
  { minLF: 3200, maxLF: 9000, article: "22K2910", note: "29 силовик" }
];

export function getHLLeverByWeightAndHeight(weightKg, khMm) {
  const w = Number(weightKg);
  const h = Number(khMm);
  if (!isFinite(w) || !isFinite(h)) return null;

  // 1) точное попадание по высоте и весу
  for (const row of hlLeverCatalogue) {
    if (h >= row.minKH && h <= row.maxKH && w >= row.minFG && w <= row.maxFG) {
      return { article: row.article, approx: false };
    }
  }

  // 2) найти более мощный рычаг в том же диапазоне высот (с минимальным maxFG >= weight)
  const candidates = hlLeverCatalogue.filter(row => h >= row.minKH && h <= row.maxKH)
    .sort((a, b) => a.maxFG - b.maxFG);
  for (const row of candidates) {
    if (w <= row.maxFG) {
      return { article: row.article, approx: false, note: 'stronger' };
    }
  }

  // 3) fallback по высоте (approx)
  for (const row of hlLeverCatalogue) {
    if (h >= row.minKH && h <= row.maxKH) {
      return { article: row.article, approx: true };
    }
  }

  return null;
}

/* Рекомендации по петлям */
export function calcHingesCount(widthMm) {
  const w = Number(widthMm);
  if (!isFinite(w)) return 2;
  if (w > 1500) return 4;
  if (w > 1000) return 3;
  return 2;
}

/* Numeric lever (35/39) по высоте */
export function calcLever(heightMm) {
  const h = Number(heightMm);
  if (!isFinite(h)) return 35;
  return h >= 840 ? 39 : 35;
}

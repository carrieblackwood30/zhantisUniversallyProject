// src/composables/aventos/hf.js
import { hfKitLF, checkLimits, calculateMechanismCount, calcHingesCount, calcLever } from "./shared";

/**
 * params: { pf, widthMm, heightMm, thicknessMm, material, weightKg }
 */
export function calculateHF(params) {
  const pf = Number(params.pf);
  const width = Number(params.widthMm);
  const height = Math.ceil(Number(params.heightMm));

  const limits = { minHeight: 479, maxHeight: 1200, maxWidth: 1828 };
  const limitCheck = checkLimits(width, height, limits, "HF top");
  if (limitCheck) return limitCheck;

  // Собираем все комплекты в массив
  const kits = Object.keys(hfKitLF)
    .map(k => ({ key: k, ...hfKitLF[k] }))
    .filter(k => isFinite(Number(k.kit)));

  if (!kits.length) {
    return { outOfRange: true, message: "Нет данных по комплектам HF." };
  }

  // Для каждого комплекта вычисляем requiredCount
  const candidates = kits.map(k => {
    const kitCapacity = Number(k.kit);
    const singleCapacity = kitCapacity / 2;
    const requiredCount = calculateMechanismCount(pf, singleCapacity, kitCapacity, 4); // 1..4 or null
    return { ...k, kitCapacity, singleCapacity, requiredCount };
  }).filter(c => c.requiredCount !== null);

  if (!candidates.length) {
    return { outOfRange: true, message: `PF = ${pf.toFixed(2)} превышает возможности доступных комплектов HF.` };
  }

  // Выбираем кандидата с минимальным requiredCount; при равенстве — с минимальным kitCapacity
  candidates.sort((a, b) => {
    if (a.requiredCount !== b.requiredCount) return a.requiredCount - b.requiredCount;
    return a.kitCapacity - b.kitCapacity;
  });

  const chosen = candidates[0];

  // numeric lever по высоте
  const numericLever = calcLever(height); // 35 или 39

  // выбираем артикул рычага по numericLever, fallback на kitData.leverArticle или kitData.article
  const leverArticle = (chosen.leverArticles && chosen.leverArticles[String(numericLever)])
    || chosen.leverArticle
    || chosen.article;

  const mechanismCount = chosen.requiredCount;
  const levers = Array.from({ length: mechanismCount }, () => numericLever);
  const leversArticles = Array.from({ length: mechanismCount }, () => leverArticle);

  const recommendation = mechanismCount === 1
    ? `Достаточно одного механизма ${chosen.key} с рычагом ${leverArticle}.`
    : `Для PF = ${pf.toFixed(2)} необходимо установить ${mechanismCount} механизма(ов) ${chosen.key} и ${mechanismCount} рычага(ов) ${leverArticle}.`;

  return {
    typeKey: "HF_top",
    pf: Number(pf.toFixed(2)),
    mechanism: { code: chosen.key, article: chosen.article, name: chosen.name ?? chosen.key },
    mechanismCount,
    requiredCount: mechanismCount,
    requiredLevers: mechanismCount,
    levers,
    leversArticles,
    hingesCount: calcHingesCount(width),
    effHeight: height,
    weightKg: params.weightKg ?? null,
    weight: params.weightKg ?? null,
    recommendation
  };
}
// src/composables/aventos/useAventosCalculator.js
import { ref } from "vue";
import { calcWeightKg } from "./shared";
import { calculateHS } from "./hs";
import { calculateHF } from "./hf";
import { calculateHL } from "./hl";
import { calculateHK } from "./hk";
import { calculateHKXS } from "./hk_xs";

export function useAventosCalculator() {
  const types = [
    { key: "HF_top", label: "AVENTOS HF top" },
    { key: "HS_top", label: "AVENTOS HS top" },
    { key: "HL_top", label: "AVENTOS HL top" },
    { key: "HK_top", label: "AVENTOS HK top" },
    { key: "HK_xs", label: "AVENTOS HK-XS" }
  ];

  const materials = { "МДФ": 700, "ЛДСП": 650 };

  const selectedType = ref("HF_top");
  const height = ref(800);
  const width = ref(600);
  const thickness = ref(18);
  const material = ref("МДФ");

  const result = ref(null);
  const hkXsSubType = ref("BLUMOTION");
  

  function selectType(key) {
    selectedType.value = key;
    result.value = null;
  }

  function reset() {
    height.value = 800;
    width.value = 600;
    thickness.value = 18;
    material.value = "МДФ";
    result.value = null;
  }

  function normalizeCalcRes(calcRes, pf, weightKg) {
    if (!calcRes) return calcRes;
    if (calcRes.outOfRange) return calcRes;

    // ensure mechanism object
    if (calcRes.mechanism && typeof calcRes.mechanism === "string") {
      calcRes.mechanism = { code: calcRes.mechanism, article: calcRes.mechanism, name: calcRes.mechanism };
    }
    if (!calcRes.mechanism && calcRes.mechanismArticle) {
      calcRes.mechanism = { code: calcRes.mechanismArticle, article: calcRes.mechanismArticle, name: calcRes.mechanismArticle };
    }

    // unify weight fields
    if (calcRes.weightKg === undefined) calcRes.weightKg = isFinite(weightKg) ? weightKg : null;
    if (calcRes.weight === undefined) calcRes.weight = calcRes.weightKg;

    // normalize arrays
    if (calcRes.levers && !Array.isArray(calcRes.levers)) {
      calcRes.levers = Array.isArray(calcRes.levers) ? calcRes.levers : [calcRes.levers];
    }
    if (calcRes.leversArticles && !Array.isArray(calcRes.leversArticles)) {
      calcRes.leversArticles = [calcRes.leversArticles];
    }

    // counts
    if (calcRes.mechanismCount === undefined && calcRes.requiredCount !== undefined) {
      calcRes.mechanismCount = calcRes.requiredCount;
    }
    if (calcRes.requiredLevers === undefined) {
      if (typeof calcRes.requiredCount === "number") calcRes.requiredLevers = calcRes.requiredCount;
      else if (Array.isArray(calcRes.leversArticles)) calcRes.requiredLevers = calcRes.leversArticles.length;
      else if (Array.isArray(calcRes.levers)) calcRes.requiredLevers = calcRes.levers.length;
      else calcRes.requiredLevers = calcRes.mechanismCount ?? 2;
    }
    if (calcRes.requiredCount === undefined) calcRes.requiredCount = calcRes.mechanismCount ?? calcRes.requiredLevers;

    // ensure arrays length equals requiredLevers
    const n = Number(calcRes.requiredLevers) || 1;

    // numeric levers
    if (!Array.isArray(calcRes.levers) || calcRes.levers.length !== n) {
      const fillVal = calcRes.leverNumeric ?? (Array.isArray(calcRes.levers) && calcRes.levers[0]) ?? 35;
      calcRes.levers = Array.from({ length: n }, () => fillVal);
    }

    // leversArticles
    if (!Array.isArray(calcRes.leversArticles) || calcRes.leversArticles.length !== n) {
      const art = (Array.isArray(calcRes.leversArticles) && calcRes.leversArticles[0]) || calcRes.mechanism?.article || null;
      calcRes.leversArticles = art ? Array.from({ length: n }, () => art) : [];
    }

    // hingesCount fallback
    if (calcRes.hingesCount === undefined && calcRes.params?.width !== undefined) {
      const w = Number(calcRes.params.width);
      if (isFinite(w)) {
        if (w > 1500) calcRes.hingesCount = 4;
        else if (w > 1000) calcRes.hingesCount = 3;
        else calcRes.hingesCount = 2;
      }
    }

    // preserve additionalHardware and approx flags if present
    if (calcRes.additionalHardware && typeof calcRes.additionalHardware === "object") {
      calcRes.additionalHardware = { ...calcRes.additionalHardware };
    }
    calcRes.approx = !!calcRes.approx;

    // --- Специально для HK_top: у HK нет петель, убираем hingesCount если есть ---
    if (calcRes.typeKey === "HK_top") {
      if (calcRes.hingesCount !== undefined) delete calcRes.hingesCount;
    }

    // ensure mechanismArticles present and синхронизируем с leversArticles для UI
    if (!Array.isArray(calcRes.mechanismArticles) || !calcRes.mechanismArticles.length) {
      if (Array.isArray(calcRes.leversArticles) && calcRes.leversArticles.length) {
        calcRes.mechanismArticles = calcRes.leversArticles.slice();
      } else if (calcRes.mechanism && calcRes.mechanism.article) {
        calcRes.mechanismArticles = [calcRes.mechanism.article];
      } else {
        calcRes.mechanismArticles = [];
      }
    } else {
      calcRes.leversArticles = calcRes.mechanismArticles.slice();
    }

    // ensure mechanism.article exists (UI может читать mechanism.article)
    if (!calcRes.mechanism) calcRes.mechanism = {};
    if (!calcRes.mechanism.article && calcRes.mechanismArticles && calcRes.mechanismArticles[0]) {
      calcRes.mechanism.article = calcRes.mechanismArticles[0];
    }

    // ensure typeKey exists
    if (!calcRes.typeKey && calcRes.typeLabel) {
      if (calcRes.typeLabel.includes("HK")) calcRes.typeKey = "HK_top";
    }

    // needsAdditionalMechanism fallback (tunable threshold)
    if (calcRes.needsAdditionalMechanism === undefined) {
      const safeThreshold = 24000; // поднят порог, чтобы 3× комплектов не помечались автоматически
      calcRes.needsAdditionalMechanism = (pf > safeThreshold && (calcRes.mechanismCount ?? 0) > 1) || (calcRes.mechanismCount ?? 0) >= 4 || !!calcRes.approx;
    }

    return calcRes;
  }

  function calculate() {
    const effHeight = Math.ceil(Number(height.value));
    const w = Number(width.value);
    const t = Number(thickness.value);
    const mat = material.value;

    if (!w || !effHeight || !t || !mat) {
      result.value = { outOfRange: true, message: "Заполните все параметры фасада." };
      return;
    }

    const weightKg = calcWeightKg(w, effHeight, t, mat);
    if (!isFinite(weightKg) || weightKg <= 0) {
      result.value = { outOfRange: true, message: "Не удалось вычислить вес фасада." };
      return;
    }

    const pf = Number((weightKg * effHeight).toFixed(2));

    const params = {
      pf,
      widthMm: w,
      heightMm: effHeight,
      thicknessMm: t,
      material: mat,
      weightKg,
      subType: hkXsSubType.value || "BLUMOTION",
    };

    let calcRes = null;
    try {
      if (selectedType.value === "HS_top") {
        calcRes = calculateHS(params);
      } else if (selectedType.value === "HL_top") {
        calcRes = calculateHL(params);
      } else if (selectedType.value === "HK_top") {
        calcRes = calculateHK(params);
      } else if (selectedType.value === "HK_xs") {
          calcRes = calculateHKXS(params)
      } else {
        calcRes = calculateHF(params);
      }
    } catch (err) {
      result.value = { outOfRange: true, message: "Ошибка в расчёте: " + (err?.message ?? String(err)) };
      return;
    }

    if (!calcRes) {
      result.value = { outOfRange: true, message: "Калькулятор не вернул результат." };
      return;
    }

    // attach params for UI fallback
    calcRes.params = { width: w, height: effHeight, thickness: t, material: mat };

    // normalize
    calcRes = normalizeCalcRes(calcRes, pf, weightKg);

    // ensure mechanismArticles present
    calcRes.mechanismArticles = calcRes.mechanismArticles ?? calcRes.leversArticles ?? (calcRes.mechanism?.article ? [calcRes.mechanism.article] : []);

    // ensure additionalHardware/approx presence
    calcRes.additionalHardware = calcRes.additionalHardware ?? null;
    calcRes.approx = calcRes.approx ?? false;

    // final result: include both weight and weightKg for templates
    result.value = {
      ...calcRes,
      weightKg: calcRes.weightKg,
      weight: calcRes.weightKg,
      pf,
      typeKey: selectedType.value,
      typeLabel: types.find(t => t.key === selectedType.value)?.label ?? selectedType.value
    };
  }

  return {
    types,
    materials,
    selectedType,
    height,
    width,
    thickness,
    material,
    result,
    calculate,
    reset,
    selectType,
    hkXsSubType
  };
}
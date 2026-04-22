<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="close"></div>
    <div class="relative bg-white rounded-lg w-full max-w-3xl mx-4 shadow-lg max-h-[90vh] overflow-scroll">
      <header class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">Калькулятор AVENTOS</h3>
        <button @click="close" class="text-gray-600 hover:text-gray-900">✕</button>
      </header>

      <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Серии -->
        <div class="md:col-span-1">
          <h4 class="font-medium mb-2">Выберите серию</h4>
          <ul class="space-y-2">
            <li v-for="t in types" :key="t.key">
              <button
                @click="handleSelectType(t.key)"
                :class="[
                  'w-full text-left px-3 py-2 rounded transition',
                  selectedType === t.key ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
                ]"
              >
                {{ t.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Параметры и результат -->
        <div class="md:col-span-2">
          <h4 class="font-medium mb-2">Параметры фасада</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="block">
              <div class="text-xs text-gray-600">Высота фасада (мм)</div>
              <input v-model.number="height" type="number" class="border p-2 rounded w-full" />
            </label>
            <label class="block">
              <div class="text-xs text-gray-600">Ширина фасада (мм)</div>
              <input v-model.number="width" type="number" class="border p-2 rounded w-full" />
            </label>
            <label class="block">
              <div class="text-xs text-gray-600">Толщина фасада (мм)</div>
              <input v-model.number="thickness" type="number" class="border p-2 rounded w-full" />
            </label>
            <label class="block">
              <div class="text-xs text-gray-600">Материал</div>
              <select v-model="material" class="border p-2 rounded w-full">
                <option v-for="(d, key) in materials" :key="key" :value="key">{{ key }}</option>
              </select>
            </label>
            <label v-if="selectedType === 'HK_xs'" class="block">
              <div class="text-xs text-gray-600">Тип HK-XS</div>
              <select v-model="hkXsSubType" class="border p-2 rounded w-full">
                <option value="BLUMOTION">BLUMOTION</option>
                <option value="TIPON">TIP-ON</option>
              </select>
            </label>
          </div>

          <div class="mt-3 flex gap-2">
            <button @click="onCalculate" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Рассчитать
            </button>
            <button @click="onReset" class="bg-gray-200 px-4 py-2 rounded">Сбросить</button>
          </div>

          <!-- Результат -->
          <div v-if="result" class="mt-4">
            <div class="bg-white border rounded p-4 shadow-sm">
              <ResultSummary
                :result="result"
                :selectedType="selectedType"
                @toggleDetails="toggleDetails"
                @copySpec="copySpec"
              />
              <transition name="fade">
                <DetailsBlock v-if="showDetails" :result="result" />
              </transition>
            </div>
          </div>

          <div v-else class="mt-4 text-sm text-gray-500">
            Нажмите Рассчитать, чтобы получить подбор механизма и силовиков.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRef } from "vue";
import { useAventosCalculator } from "@/composables/aventos/useAventosCalculator";
import DetailsBlock from "@/components/aventos/DetailsBlock.vue";
import ResultSummary from "@/components/aventos/ResultSummary.vue";

const props = defineProps({ show: Boolean });
const emit = defineEmits(["update:show"]);
const show = toRef(props, "show");

const {
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
} = useAventosCalculator();

watch(show, (v) => emit("update:show", v));

const showDetails = ref(false);

function close() {
  emit("update:show", false);
}

function onCalculate() {
  try {
    calculate();
    showDetails.value = !!result.value;
  } catch (err) {
    alert(err.message || "Ошибка при расчёте");
  }
}

function onReset() {
  reset();
  showDetails.value = false;
}

function handleSelectType(key) {
  selectType(key);
}

function toggleDetails() {
  showDetails.value = !showDetails.value;
}

function copySpec() {
  if (!result.value || result.value.outOfRange) return;
  const r = result.value;
  const leversText = r.typeKey === "HS_top"
    ? `${r.levers[0]} силовика`
    : r.levers?.map(c => `${c}`).join(", ") || "-";
  const lines = [
    `Тип: ${r.typeLabel}`,
    `Механизм: ${r.mechanism?.code} — ${r.mechanism?.name}`,
    `Силовые элементы: ${leversText}`,
    `Параметры фасада: H=${r.params.height} мм, W=${r.params.width} мм, T=${r.params.thickness} мм, Материал=${r.params.material}`,
    `Вес: ${r.weight?.toFixed(2)} кг`,
    `PF: ${r.pf?.toFixed(0)}`,
  ];
  if (r.outOfRange) {
    lines.push(`Предупреждение: ${r.message}`);
  } else {
    lines.push(`Рекомендация: ${r.recommendation}`);
  }
  const text = lines.join("\n");
  navigator.clipboard?.writeText(text).then(() => {
    alert("Спецификация и рекомендация скопированы в буфер обмена");
  });
}

console.log(hkXsSubType.value);
</script>
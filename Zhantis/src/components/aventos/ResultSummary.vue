<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="flex flex-wrap gap-6">
      <div>
        <div class="text-xs text-gray-500">Механизм</div>
        <div class="font-semibold text-sm">
          {{ result.mechanism?.code }} — {{ result.mechanism?.name }}
        </div>
      </div>

      <!-- Для HS показываем количество силовых механизмов, для HL/HF — артикул рычага -->
      <div v-if="selectedType === 'HS_top'">
        <div class="text-xs text-gray-500">Силовых механизмов</div>
        <div class="font-medium text-sm">{{ result.mechanismCount }}</div>
      </div>

      <div v-else-if="result.leversArticles?.length">
        <div class="text-xs text-gray-500">Рычаг</div>
        <!-- выводим артикул рычага и рядом numeric lever -->
        <div class="font-medium text-sm">
          {{ result.leversArticles[0] }}
          <span class="text-gray-500">({{ result.levers[0] }})</span>
        </div>
      </div>

      <div>
        <div class="text-xs text-gray-500">PF</div>
        <div class="font-medium text-sm">{{ result.pf?.toFixed(0) }}</div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button @click="$emit('toggleDetails')" class="px-3 py-1 bg-gray-100 rounded text-sm">
        Подробнее
      </button>
      <button @click="$emit('copySpec')" class="px-3 py-1 bg-gray-100 rounded text-sm">
        Копировать
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  result: Object,
  selectedType: String,
});
</script>
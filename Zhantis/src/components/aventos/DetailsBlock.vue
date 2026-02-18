<template>
  <div v-if="result" class="mt-4 max-h-96 overflow-y-auto pr-2 space-y-2 text-sm">
    <!-- Усиление -->
    <div v-if="result.needsAdditionalMechanism" class="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
      <div class="font-semibold text-yellow-800 mb-1">⚠ Требуется усиление</div>
      <p class="text-yellow-700">
        {{ result.recommendation }}
      </p>
    </div>

    <!-- Общие поля -->
    <div class="flex justify-between border-b pb-1">
      <span class="text-gray-600">Вес фасада</span>
      <span>{{ result.weight?.toFixed(2) }} кг</span>
    </div>

    <div class="flex justify-between border-b pb-1">
      <span class="text-gray-600">Эфф. высота (округлена вверх)</span>
      <span>{{ result.effHeight || '-' }} мм</span>
    </div>

    <!-- HF -->
    <template v-if="result.typeKey === 'HF_top'">
      <div class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Механизм</span>
        <span>{{ result.mechanism?.code }} — {{ result.mechanism?.name }}</span>
      </div>

      <div class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Рычаг</span>
        <span>{{ result.levers?.[0] || '-' }}</span>
      </div>

      <div class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Рекомендуемые петли</span>
        <span>{{ result.hingesCount || '-' }}</span>
      </div>
    </template>

    <!-- HS / HL / HK -->
    <template v-else-if="['HS_top','HL_top','HK_top'].includes(result.typeKey)">
      <div class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Силовых механизмов</span>
        <span>
          {{ result.mechanismCount + 1 }} × {{ result.mechanismArticles?.[0] ?? result.mechanism?.article ?? '-' }}
        </span>
      </div>
      <div v-if="result.mechanismArticles?.length > 1" class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Артикулы</span>
        <span>{{ result.mechanismArticles.join(', ') }}</span>
      </div>
      <div v-if="result.additionalHardware" class="flex justify-between border-b pb-1">
        <span class="text-gray-600">Доп. оборудование</span>
        <span>
          <span v-if="result.additionalHardware.shafts">Валы: {{ result.additionalHardware.shafts }}</span>
          <span v-if="result.additionalHardware.connector">; соединитель</span>
        </span>
      </div>
    </template>

    <!-- Ошибки -->
    <div v-if="result.outOfRange" class="bg-red-100 text-red-800 p-3 rounded">
      {{ result.message }}
    </div>

    <!-- Рекомендация -->
    <div v-else-if="!result.needsAdditionalMechanism && result.recommendation" class="bg-green-50 p-3 rounded">
      <p class="font-medium text-gray-700">{{ result.recommendation }}</p>
    </div>

    <!-- Примечание -->
    <div>
      <label class="text-xs text-gray-600">Примечание (будет видно в заказе)</label>
      <input
        v-model="orderNote"
        class="w-full border rounded p-2 mt-1 text-sm"
        placeholder="Например: добавить доп. силовик HF-35"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref } from "vue";
const props = defineProps({ result: Object });
const orderNote = ref("");
</script>
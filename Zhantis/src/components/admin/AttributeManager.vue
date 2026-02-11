<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow w-96">
      <h3 class="text-lg font-semibold mb-4">Редактировать опции: {{ attr.label }}</h3>

      <div v-for="(opt, idx) in localValues" :key="opt.value || idx" class="mb-2 flex items-center gap-2">
        <input v-model="opt.label" class="border p-1 flex-1" />
        <input v-model="opt.meta.hex" type="color" class="w-10 h-8 p-0 border" />
        <button @click="remove(idx)" class="bg-red-500 text-white px-2 py-1 rounded">Удалить</button>
      </div>

      <div class="flex gap-2 mt-3">
        <input v-model="newLabel" placeholder="Новая опция" class="border p-1 flex-1" />
        <input v-model="newHex" type="color" class="w-10 h-8 p-0 border" />
        <button @click="add" class="bg-blue-500 text-white px-3 py-1 rounded">Добавить</button>
      </div>

      <div class="flex justify-end mt-4 gap-2">
        <button @click="$emit('close')" class="bg-gray-200 px-3 py-1 rounded">Отмена</button>
        <button @click="save" class="bg-green-500 text-white px-3 py-1 rounded">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useProductsStore } from "@/stores/products";

const props = defineProps({ show: Boolean, attribute: Object });
const emit = defineEmits(["close", "saved"]);
const productsStore = useProductsStore();

const attr = ref(props.attribute || {});
const localValues = ref([]);
const newLabel = ref("");
const newHex = ref("#ffffff");

watch(() => props.attribute, (v) => {
  attr.value = v || {};
  localValues.value = (v?.values || []).map(o => ({ value: o.value, label: o.label, meta: { ...(o.meta || {}) } }));
});

function add() {
  const label = (newLabel.value || "").trim();
  if (!label) return;
  const value = label.toLowerCase().replace(/\s+/g, "-");
  localValues.value.push({ value, label, meta: { hex: newHex.value } });
  newLabel.value = ""; newHex.value = "#ffffff";
}

function remove(idx) { localValues.value.splice(idx, 1); }

async function save() {
  try {
    const payload = { ...attr.value, values: localValues.value };
    let res;
    if (attr.value._id) res = await productsStore.updateAttribute(attr.value._id, payload);
    else res = await productsStore.createAttribute(payload);
    emit("saved", res);
  } catch (err) {
    // ошибка логируется в store
  }
}
</script>
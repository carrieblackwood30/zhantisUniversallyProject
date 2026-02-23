<template>
  <div class="bg-white p-4 rounded shadow mb-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <!-- Группа -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Группа</label>
        <select v-model="local.group" @change="onGroupChange" class="border p-2 w-full">
          <option :value="null">Все</option>
          <option v-for="g in groups" :key="g._id" :value="g._id">{{ g.name }}</option>
        </select>
      </div>

      <!-- Подгруппа -->
      <div>
        <label class="block text-sm text-gray-600 mb-1">Подгруппа</label>
        <select v-model="local.subgroup" @change="onAnyChange" class="border p-2 w-full">
          <option :value="null">Все</option>
          <option v-for="s in filteredSubgroups" :key="s._id" :value="s._id">{{ s.name }}</option>
        </select>
      </div>

      <!-- Тип выдвижения (только для группы "Направляющие скрытого монтажа") -->
      <div v-if="isHiddenMountGroupSelected">
        <label class="block text-sm text-gray-600 mb-1">Тип выдвижения</label>
        <select v-model="local.attributes.extension" @change="onAnyChange" class="border p-2 w-full">
          <option :value="null">Все</option>
          <option value="полное">Полное</option>
          <option value="частичное">Частичное</option>
        </select>
      </div>

      <!-- Дополнительные динамические атрибуты -->
      <div v-for="attr in attributes" :key="attr.key">
        <label class="block text-sm text-gray-600 mb-1">{{ attr.label }}</label>
        <select
          v-if="attr.values && attr.values.length"
          v-model="local.attributes[attr.key]"
          @change="onAnyChange"
          class="border p-2 w-full"
        >
          <option :value="null">Все</option>
          <option v-for="v in attr.values" :key="v" :value="v">{{ v }}</option>
        </select>
        <input
          v-else
          v-model="local.attributes[attr.key]"
          @input="onAnyChange"
          class="border p-2 w-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductsStore } from "@/stores/products";
import api from "@/api";

const emit = defineEmits(["changed"]);
const store = useProductsStore();

const groups = ref([]);
const subgroups = ref([]);
const attributes = ref([]);

const local = ref({
  group: null,
  subgroup: null,
  attributes: {
    extension: null,
  },
});

async function loadGroups() {
  try {
    const res = await api.get("/groups");
    groups.value = res.data || [];
  } catch (err) {
    console.error("Ошибка загрузки групп", err);
    groups.value = [];
  }
}

async function loadSubgroups(params = {}) {
  try {
    const res = await api.get("/subgroups", { params });
    subgroups.value = res.data || [];
  } catch (err) {
    console.error("Ошибка загрузки подгрупп", err);
    subgroups.value = [];
  }
}

async function loadAttributes() {
  try {
    const params = {};
    if (local.value.group) params.group = local.value.group;
    if (local.value.subgroup) params.subgroup = local.value.subgroup;
    if (!local.value.group && !local.value.subgroup) params.global = "true";

    const res = await api.get("/attributes", { params });
    attributes.value = res.data || [];
  } catch (err) {
    console.error("Ошибка загрузки атрибутов", err);
    attributes.value = [];
  }
}

onMounted(async () => {
  await loadGroups();
  await loadSubgroups();
  await loadAttributes();
});

const filteredSubgroups = computed(() => {
  if (!local.value.group) return subgroups.value;
  return subgroups.value.filter(s => {
    const pg = s.parentGroup;
    const pgId = pg?._id ? String(pg._id) : String(pg);
    return pgId === String(local.value.group);
  });
});

const isHiddenMountGroupSelected = computed(() => {
  const selectedGroup = groups.value.find(g => g._id === local.value.group);
  return selectedGroup?.name?.toLowerCase().trim() === "направляющие скрытого монтажа";
});

const onAnyChange = () => {
  applyFilters();
};

const onGroupChange = () => {
  local.value.subgroup = null;
  local.value.attributes.extension = null;
  applyFilters();
};

const applyFilters = () => {
  store.filters = {};

  if (local.value.group) store.filters.group = local.value.group;
  if (local.value.subgroup) store.filters.subgroup = local.value.subgroup;

  Object.keys(local.value.attributes || {}).forEach(k => {
    const v = local.value.attributes[k];
    if (v !== null && v !== undefined && v !== "") {
      store.filters[k] = v;
    }
  });

  emit("changed", { ...(store.filters || {}) });
};
</script>